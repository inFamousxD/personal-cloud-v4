import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

const TagInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const TagsWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 32px;
    padding: 6px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    align-items: center;

    &:focus-within {
        border-color: ${darkTheme.accent};
    }
`;

const Tag = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    background: ${darkTheme.accent}30;
    color: ${darkTheme.accent};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;

    .material-symbols-outlined {
        font-size: 14px;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;

        &:hover {
            opacity: 1;
        }
    }
`;

const TagInputField = styled.input`
    flex: 1;
    min-width: 120px;
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    font-size: 12px;
    outline: none;
    font-family: inherit;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }
`;

const SuggestionsDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    margin-top: 4px;
    max-height: 150px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${darkTheme.backgroundDarker};
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }
`;

const SuggestionItem = styled.div<{ $selected: boolean }>`
    padding: 8px 12px;
    font-size: 12px;
    color: ${darkTheme.text.color};
    cursor: pointer;
    background: ${props => props.$selected ? darkTheme.accent + '20' : 'transparent'};

    &:hover {
        background: ${darkTheme.accent}30;
    }
`;

const InputWrapper = styled.div`
    position: relative;
`;

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    availableTags: string[];
    placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, availableTags, placeholder = 'Add tags...' }) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredTags = tags.filter(tag => tag !== 'default');

    const suggestions = availableTags
        .filter(tag => 
            !filteredTags.includes(tag) && 
            tag.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, 10);

    useEffect(() => {
        setSelectedSuggestionIndex(0);
    }, [inputValue]);

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !filteredTags.includes(trimmedTag)) {
            const newTags = [...filteredTags, trimmedTag];
            onChange(newTags.length > 0 ? newTags : ['default']);
            setInputValue('');
            setShowSuggestions(false);
            inputRef.current?.focus();
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = filteredTags.filter(tag => tag !== tagToRemove);
        onChange(newTags.length > 0 ? newTags : ['default']);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                addTag(suggestions[selectedSuggestionIndex]);
            } else if (inputValue.trim()) {
                addTag(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && filteredTags.length > 0) {
            removeTag(filteredTags[filteredTags.length - 1]);
        } else if (e.key === 'ArrowDown' && showSuggestions) {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => 
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp' && showSuggestions) {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : prev);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setShowSuggestions(value.length > 0);
    };

    return (
        <TagInputContainer>
            <InputWrapper>
                <TagsWrapper>
                    {filteredTags.map(tag => (
                        <Tag key={tag}>
                            {tag}
                            <span 
                                className="material-symbols-outlined"
                                onClick={() => removeTag(tag)}
                            >
                                close
                            </span>
                        </Tag>
                    ))}
                    <TagInputField
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => inputValue && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder={filteredTags.length === 0 ? placeholder : ''}
                    />
                </TagsWrapper>
                {showSuggestions && suggestions.length > 0 && (
                    <SuggestionsDropdown>
                        {suggestions.map((tag, index) => (
                            <SuggestionItem
                                key={tag}
                                $selected={index === selectedSuggestionIndex}
                                onClick={() => addTag(tag)}
                            >
                                {tag}
                            </SuggestionItem>
                        ))}
                    </SuggestionsDropdown>
                )}
            </InputWrapper>
        </TagInputContainer>
    );
};

export default TagInput;