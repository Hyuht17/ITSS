import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import { messagesAPI } from '../services/api';
import './Messages.css';
import sendIcon from '../assets/send.svg';
import paperclipIcon from '../assets/paperclip.svg';

const Messages = () => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Fetch conversations list on mount
    useEffect(() => {
        fetchConversations();
    }, []);

    // Auto-select conversation if coming from navigation with selectedUserId
    useEffect(() => {
        if (location.state?.selectedUserId) {
            setSelectedUserId(location.state.selectedUserId);
        }
    }, [location.state]);

    // Fetch conversation when user is selected
    useEffect(() => {
        if (selectedUserId) {
            fetchConversation(selectedUserId);
        }
    }, [selectedUserId]);

    // Scroll to bottom when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await messagesAPI.getMessageList();
            if (response.success) {
                setConversations(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversation = async (userId) => {
        try {
            const response = await messagesAPI.getConversation(userId);
            if (response.success) {
                setMessages(response.data.messages || []);
                setSelectedUser(response.data.otherUser);
            }
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
        }
    };

    const handleConversationClick = (userId) => {
        // Instant UI update - clear unread count immediately
        setConversations(prev => prev.map(conv =>
            conv.user._id === userId
                ? { ...conv, unreadCount: 0 }
                : conv
        ));

        // Then proceed with selection and fetching
        setSelectedUserId(userId);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB = 5 * 1024 * 1024 bytes)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setFileError('ファイルサイズは5MB以下にしてください');
            setSelectedFile(null);
            return;
        }

        setFileError('');
        setSelectedFile(file);
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setFileError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() && !selectedFile) return;
        if (!selectedUserId) return;

        try {
            setSending(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('receiverId', selectedUserId);

            // Only append content if it has text
            if (newMessage.trim()) {
                formData.append('content', newMessage.trim());
            }

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await messagesAPI.sendMessage(formData);

            if (response.success) {
                // Add new message to the list
                setMessages(prev => [...prev, response.data]);
                setNewMessage('');
                handleClearFile();

                // Refresh conversations list to update latest message
                fetchConversations();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('メッセージの送信に失敗しました');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'たった今';
        if (diffMins < 60) return `${diffMins}分前`;
        if (diffHours < 24) return `${diffHours}時間前`;
        if (diffDays < 7) return `${diffDays}日前`;

        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="app-container">
            <SideMenu activeItem="messages" />

            <div className="messages-container">
                {/* Message List (Center) */}
                <div className="message-list-panel">
                    <div className="message-list-header">
                        <h2>メッセージ</h2>
                    </div>

                    <div className="conversation-list">
                        {loading ? (
                            <div className="loading-message">読み込み中...</div>
                        ) : conversations.length === 0 ? (
                            <div className="empty-message">メッセージがありません</div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.user._id}
                                    className={`conversation-item ${selectedUserId === conv.user._id ? 'active' : ''}`}
                                    onClick={() => handleConversationClick(conv.user._id)}
                                >
                                    <div className="conversation-avatar">
                                        {conv.user.profilePhoto ? (
                                            <img src={conv.user.profilePhoto} alt={conv.user.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {conv.user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conversation-top">
                                            <span className="conversation-name">{conv.user.name}</span>
                                            <span className="conversation-time">
                                                {formatTimestamp(conv.latestMessage.timestamp)}
                                            </span>
                                        </div>
                                        <div className="conversation-preview">
                                            {conv.latestMessage.attachment ? (
                                                <span>📎 {conv.latestMessage.attachment.fileName}</span>
                                            ) : (
                                                conv.latestMessage.content
                                            )}
                                        </div>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="unread-badge">{conv.unreadCount}</div>
                                    )}
                                    <button className="conversation-menu">⋮</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Conversation View (Right) */}
                <div className="conversation-panel">
                    {selectedUserId ? (
                        <>
                            {/* Chat Header */}
                            <div className="conversation-header">
                                <div className="header-user-info">
                                    <div className="header-avatar">
                                        {selectedUser?.profilePhoto ? (
                                            <img src={selectedUser.profilePhoto} alt={selectedUser.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {selectedUser?.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="header-name">{selectedUser?.name}</span>
                                </div>
                                <button className="header-menu">⋮</button>
                            </div>

                            {/* Messages Area */}
                            <div className="messages-area">
                                {messages.map(msg => (
                                    <div
                                        key={msg._id}
                                        className={`message-bubble-wrapper ${msg.isSentByMe ? 'sent' : 'received'}`}
                                    >
                                        {!msg.isSentByMe && (
                                            <div className="message-avatar">
                                                {selectedUser?.profilePhoto ? (
                                                    <img src={selectedUser.profilePhoto} alt={selectedUser.name} />
                                                ) : (
                                                    <div className="avatar-placeholder-small">
                                                        {selectedUser?.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="message-bubble">
                                            {msg.content && (
                                                <div className="message-content">{msg.content}</div>
                                            )}

                                            {/* Show attachment if present */}
                                            {msg.attachment && (
                                                <div className="message-attachment">
                                                    <a
                                                        href={msg.attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download={msg.attachment.fileName}
                                                    >
                                                        📎 {msg.attachment.fileName}
                                                        <span className="file-size">
                                                            ({formatFileSize(msg.attachment.fileSize)})
                                                        </span>
                                                    </a>
                                                </div>
                                            )}

                                            <div className="message-time">
                                                {formatMessageTime(msg.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form className="message-input-area" onSubmit={handleSendMessage}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    accept="*/*"
                                />
                                <button
                                    type="button"
                                    className="attach-button"
                                    title="ファイル添付"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <img src={paperclipIcon} alt="Attach" className="w-5 h-5 mt-0.5 opacity-60" />
                                </button>

                                <div className="input-wrapper">
                                    {/* File preview */}
                                    {selectedFile && (
                                        <div className="selected-file-preview">
                                            <span>📎 {selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
                                            <button type="button" onClick={handleClearFile}>×</button>
                                        </div>
                                    )}

                                    {/* Error message */}
                                    {fileError && (
                                        <div className="file-error">{fileError}</div>
                                    )}

                                    <input
                                        type="text"
                                        className="message-input"
                                        placeholder="メッセージを入力..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={sending}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="send-button"
                                    disabled={sending || (!newMessage.trim() && !selectedFile)}
                                    title="送信"
                                >
                                    <img src={sendIcon} alt="Send" className="w-5 h-5 mt-0.5" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-conversation-selected">
                            <p>会話を選択してください</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
