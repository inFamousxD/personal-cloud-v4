import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { agentApi, Message, Chat } from '../../../services/agentApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    AgentContainer,
    AgentSidebar,
    SidebarOverlay,
    SidebarHeader,
    SidebarTitle,
    SidebarActions,
    IconButton,
    SidebarBody,
    ChatListItem,
    ChatInfo,
    ChatTitle,
    ChatDate,
    ChatActions,
    EmptyChats,
    ChatContent,
    ChatHeader,
    HeaderLeft,
    ToggleSidebarButton,
    ChatTitleDisplay,
    HeaderRight,
    StatusIndicator,
    ModelSelector,
    SettingsButton,
    MessagesArea,
    MessagesContainer,
    MessageBubble,
    EmptyState,
    InputArea,
    InputWrapper,
    TextArea,
    SendButton,
    StopButton,
    ModalOverlay,
    ModalContent,
    SettingGroup,
    SettingValue,
    ModalActions,
    ActionButton,
    LoadingState,
} from './AgentChat.styles';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const AgentChat = () => {
    const { chatId } = useParams<{ chatId?: string }>();
    const navigate = useNavigate();
    const topOptions = useSelector((state: RootState) => state.mainDock.dockTopOptions);

    // State
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState('llama3.2');
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [renderError, setRenderError] = useState<string | null>(null);

    // Settings
    const [showSettings, setShowSettings] = useState(false);
    const [contextLimit, setContextLimit] = useState(20);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Initial load
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load chat when chatId changes
    useEffect(() => {
        if (chatId) {
            loadChat(chatId);
        } else {
            setMessages([]);
            setCurrentChatId(null);
        }
    }, [chatId]);

    // Auto-scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadInitialData = async () => {
        try {
            setLoading(true);
            await checkHealth();
            await loadModels();
            await loadChats();
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setLoading(false);
        }
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

    const loadChats = async () => {
        try {
            const chatsData = await agentApi.getAllChats();
            setChats(chatsData);
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };

    const loadChat = async (id: string) => {
        try {
            setRenderError(null);
            console.log('Loading chat:', id);
            
            const response = await agentApi.getChat(id);
            console.log('Chat response:', response);
            
            const { messages: chatMessages } = response;
            console.log('Chat messages:', chatMessages);
            
            if (!chatMessages || !Array.isArray(chatMessages)) {
                console.error('Invalid messages format:', chatMessages);
                setMessages([]);
                setCurrentChatId(id);
                return;
            }

            const validMessages = chatMessages.filter((msg, index) => {
                const isValid = msg && 
                    typeof msg === 'object' && 
                    msg.role && 
                    typeof msg.content === 'string';
                
                if (!isValid) {
                    console.warn(`Invalid message at index ${index}:`, msg);
                }
                return isValid;
            });

            console.log('Valid messages count:', validMessages.length);
            setMessages(validMessages);
            setCurrentChatId(id);
        } catch (error: any) {
            console.error('Error loading chat:', error);
            setRenderError(error.message || 'Failed to load chat');
            setMessages([]);
            setCurrentChatId(null);
        }
    };

    const handleNewChat = async () => {
        try {
            navigate(`/agent`);
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this chat?')) return;

        try {
            await agentApi.deleteChat(id);
            setChats(chats.filter(c => c._id !== id));
            if (currentChatId === id) {
                navigate('/agent');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isStreaming || !isConnected) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsStreaming(true);

        const assistantMessage: Message = {
            role: 'assistant',
            content: '',
        };
        setMessages([...updatedMessages, assistantMessage]);

        abortControllerRef.current = new AbortController();

        await agentApi.streamChat(
            {
                model: selectedModel,
                messages: updatedMessages,
                chatId: currentChatId || undefined,
                contextLimit,
            },
            (chunk, receivedChatId) => {
                if (receivedChatId && !currentChatId) {
                    setCurrentChatId(receivedChatId);
                    window.history.replaceState(null, '', `/agent/${receivedChatId}`);
                    loadChats();
                }

                setMessages(prev => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    const lastMsg = updated[updated.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                        lastMsg.content = chunk;
                    }
                    return updated;
                });
            },
            () => {
                setIsStreaming(false);
                abortControllerRef.current = null;
                loadChats();
            },
            (error) => {
                console.error('Chat error:', error);
                setIsStreaming(false);
                setMessages(prev => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    const lastMsg = updated[updated.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
                        lastMsg.content = '❌ Error: Failed to get response';
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

    const formatDate = (date: Date) => {
        const now = new Date();
        const chatDate = new Date(date);
        const diffMs = now.getTime() - chatDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return chatDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const currentChat = useMemo(() => {
        return chats.find(c => c._id === currentChatId);
    }, [chats, currentChatId]);

    if (loading) {
        return (
            <AgentContainer>
                <ChatContent $sidebarCollapsed={true}>
                    <LoadingState>
                        <div className="lds-ring">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </LoadingState>
                </ChatContent>
            </AgentContainer>
        );
    }

    if (renderError) {
        return (
            <AgentContainer>
                <ChatContent $sidebarCollapsed={true}>
                    <EmptyState>
                        <span className="material-symbols-outlined">error</span>
                        <h3>Error Loading Chat</h3>
                        <p>{renderError}</p>
                        <button 
                            onClick={() => {
                                setRenderError(null);
                                navigate('/agent');
                            }}
                            style={{
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginTop: '16px'
                            }}
                        >
                            Go Back
                        </button>
                    </EmptyState>
                </ChatContent>
            </AgentContainer>
        );
    }

    return (
        <AgentContainer>
            {!sidebarCollapsed && (
                <SidebarOverlay onClick={() => setSidebarCollapsed(true)} />
            )}

            <AgentSidebar $collapsed={sidebarCollapsed}>
                <SidebarHeader>
                    <SidebarTitle>
                        <span className="material-symbols-outlined">
                            {topOptions.find(o => o.id === 'agent')?.icon || 'smart_toy'}
                        </span>
                        Agent Chats
                    </SidebarTitle>
                    <SidebarActions>
                        <IconButton onClick={handleNewChat} title="New chat">
                            <span className="material-symbols-outlined">add</span>
                        </IconButton>
                    </SidebarActions>
                </SidebarHeader>

                <SidebarBody>
                    {chats.length === 0 ? (
                        <EmptyChats>
                            <span className="material-symbols-outlined">chat_bubble</span>
                            <p>No chats yet. Start a new conversation!</p>
                        </EmptyChats>
                    ) : (
                        chats.map(chat => (
                            <ChatListItem
                                key={chat._id}
                                $selected={currentChatId === chat._id}
                                onClick={() => navigate(`/agent/${chat._id}`)}
                            >
                                <span className="material-symbols-outlined">chat</span>
                                <ChatInfo>
                                    <ChatTitle>{chat.title}</ChatTitle>
                                    <ChatDate>{formatDate(chat.updatedAt)}</ChatDate>
                                </ChatInfo>
                                <ChatActions className="chat-actions">
                                    <button onClick={(e) => handleDeleteChat(chat._id, e)} title="Delete">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </ChatActions>
                            </ChatListItem>
                        ))
                    )}
                </SidebarBody>
            </AgentSidebar>

            <ChatContent $sidebarCollapsed={sidebarCollapsed}>
                <ChatHeader>
                    <HeaderLeft>
                        <ToggleSidebarButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                            <span className="material-symbols-outlined">
                                {sidebarCollapsed ? 'menu' : 'menu_open'}
                            </span>
                        </ToggleSidebarButton>
                        {currentChat && (
                            <ChatTitleDisplay title={currentChat.title}>
                                {currentChat.title}
                            </ChatTitleDisplay>
                        )}
                    </HeaderLeft>

                    <HeaderRight>
                        <StatusIndicator $connected={isConnected}>
                            {isConnected ? '●' : '○'}
                        </StatusIndicator>
                        <ModelSelector
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={isStreaming}
                        >
                            {models.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </ModelSelector>
                        <SettingsButton onClick={() => setShowSettings(true)} title="Settings">
                            <span className="material-symbols-outlined">settings</span>
                        </SettingsButton>
                    </HeaderRight>
                </ChatHeader>

                <MessagesArea>
                    {messages.length === 0 ? (
                        <EmptyState>
                            <span className="material-symbols-outlined">smart_toy</span>
                            <h3>Start a conversation</h3>
                            <p>Ask me anything. I'm here to help!</p>
                        </EmptyState>
                    ) : (
                        <MessagesContainer>
                            {messages.filter(msg => msg && msg.content).map((msg, idx) => (
                                <MessageBubble key={idx} $role={msg.role}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            code({ node, inline, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
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
                    )}

                    <InputArea>
                        <InputWrapper>
                            <TextArea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Message Agent..."
                                disabled={isStreaming || !isConnected}
                                rows={1}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                                }}
                            />
                            {isStreaming ? (
                                <StopButton onClick={handleStop} title="Stop generating">
                                    <span className="material-symbols-outlined">stop_circle</span>
                                </StopButton>
                            ) : (
                                <SendButton 
                                    onClick={handleSend} 
                                    disabled={!input.trim() || !isConnected}
                                    title="Send message"
                                >
                                    <span className="material-symbols-outlined">arrow_upward</span>
                                </SendButton>
                            )}
                        </InputWrapper>
                    </InputArea>
                </MessagesArea>
            </ChatContent>

            {/* Settings Modal */}
            {showSettings && (
                <ModalOverlay onClick={() => setShowSettings(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>Chat Settings</h3>
                        
                        <SettingGroup>
                            <label>
                                Context Window (messages)
                                <SettingValue>{contextLimit}</SettingValue>
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                step="5"
                                value={contextLimit}
                                onChange={(e) => setContextLimit(Number(e.target.value))}
                            />
                            <p style={{ fontSize: '0.85em', opacity: 0.7, marginTop: '8px' }}>
                                Number of previous messages to include as context. 
                                Default: 20 (recommended for Gemma 4B).
                            </p>
                        </SettingGroup>

                        <SettingGroup>
                            <label>Current Model</label>
                            <p style={{ fontSize: '0.9em', opacity: 0.8 }}>
                                {selectedModel}
                            </p>
                        </SettingGroup>

                        <SettingGroup>
                            <label>Connection Status</label>
                            <StatusIndicator $connected={isConnected}>
                                {isConnected ? '● Connected' : '○ Disconnected'}
                            </StatusIndicator>
                        </SettingGroup>

                        <ModalActions>
                            <ActionButton onClick={() => setShowSettings(false)}>
                                Close
                            </ActionButton>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </AgentContainer>
    );
};

export default AgentChat;