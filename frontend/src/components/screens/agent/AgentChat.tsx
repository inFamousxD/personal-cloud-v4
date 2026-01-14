import { useState, useEffect, useRef } from 'react';
import { agentApi, Message } from '../../../services/agentApi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    AgentContainer,
    AgentHeader,
    AgentTitle,
    ModelSelector,
    ChatArea,
    MessagesContainer,
    MessageBubble,
    InputArea,
    TextArea,
    SendButton,
    StopButton,
    StatusIndicator,
} from './AgentChat.styles';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const AgentChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState('llama3.2');
    const [isConnected, setIsConnected] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const topOptions = useSelector((state: RootState) => state.mainDock.dockTopOptions);

    useEffect(() => {
        loadModels();
        checkHealth();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadModels = async () => {
        try {
            const data = await agentApi.getModels();
            const modelNames = data.map((m: any) => m.name);
            setModels(modelNames);
            if (modelNames.length > 0 && !modelNames.includes(selectedModel)) {
                setSelectedModel(modelNames[0]);
            }
        } catch (error) {
            console.error('Error loading models:', error);
        }
    };

    const checkHealth = async () => {
        try {
            await agentApi.checkHealth();
            setIsConnected(true);
        } catch (error) {
            setIsConnected(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isStreaming) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsStreaming(true);

        const assistantMessage: Message = {
            role: 'assistant',
            content: '',
        };
        setMessages(prev => [...prev, assistantMessage]);

        abortControllerRef.current = new AbortController();

        await agentApi.streamChat(
            {
                model: selectedModel,
                messages: [...messages, userMessage],
            },
            (chunk) => {
                setMessages(prev => {
                    const updated = [...prev];
                    const lastMessage = updated[updated.length - 1];
                    if (lastMessage.role === 'assistant') {
                        lastMessage.content = chunk; // Changed from += to =
                    }
                    return updated;
                });
            },
            () => {
                setIsStreaming(false);
                abortControllerRef.current = null;
            },
            (error) => {
                console.error('Chat error:', error);
                setIsStreaming(false);
                setMessages(prev => {
                    const updated = [...prev];
                    const lastMessage = updated[updated.length - 1];
                    if (lastMessage.role === 'assistant' && !lastMessage.content) {
                        lastMessage.content = '❌ Error: Failed to get response';
                    }
                    return updated;
                });
                abortControllerRef.current = null;
            },
            abortControllerRef.current
        );
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AgentContainer>
            <AgentHeader>
                <AgentTitle>
                    <span className="material-symbols-outlined">
                        {topOptions.find(o => o.id === 'agent')?.icon}
                    </span>
                    Agent Chat
                    <StatusIndicator $connected={isConnected}>
                        {isConnected ? '●' : '○'}
                    </StatusIndicator>
                </AgentTitle>
                <ModelSelector
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isStreaming}
                >
                    {models.map(model => (
                        <option key={model} value={model}>{model}</option>
                    ))}
                </ModelSelector>
            </AgentHeader>

            <ChatArea>
                <MessagesContainer>
                    {messages.map((msg, idx) => (
                        <MessageBubble key={idx} $role={msg.role}>
                            <ReactMarkdown
                                components={{
                                    code({ node, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const inline = !match;
                                        
                                        return !inline ? (
                                            <SyntaxHighlighter
                                                style={vscDarkPlus as any}
                                                language={match[1]}
                                                PreTag="div"
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </MessageBubble>
                    ))}
                    <div ref={messagesEndRef} />
                </MessagesContainer>
            </ChatArea>

            <InputArea>
                <TextArea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isStreaming || !isConnected}
                />
                {isStreaming ? (
                    <StopButton onClick={handleStop}>
                        <span className="material-symbols-outlined">stop</span>
                        Stop
                    </StopButton>
                ) : (
                    <SendButton onClick={handleSend} disabled={!input.trim() || !isConnected}>
                        <span className="material-symbols-outlined">send</span>
                        Send
                    </SendButton>
                )}
            </InputArea>
        </AgentContainer>
    );
};

export default AgentChat;