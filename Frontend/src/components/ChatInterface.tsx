import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Plus, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Menu,
  MessageSquare,
  FileText,
  Clock,
  Settings,
  User,
  MoreVertical,
  Trash2,
  Edit3,
  LogOut,
  Sun,
  Moon,
  Download,
  Upload
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  documentSummary?: {
    title: string;
    summary: string;
    keyPoints: string[];
  };
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: Date;
  preview: string;
  messageCount: number;
}

interface ChatInterfaceProps {
  onBack: () => void;
}

export default function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm Sparrow, your legal AI assistant. I can help you with legal questions, analyze documents, and provide research assistance. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState('current');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatSessions: ChatSession[] = [
    {
      id: 'current',
      title: 'New Chat',
      lastMessage: new Date(),
      preview: 'How can I help you today?',
      messageCount: 1
    },
    {
      id: '1',
      title: 'Contract Review Analysis',
      lastMessage: new Date(Date.now() - 3600000),
      preview: 'What should I look for in an employment contract?',
      messageCount: 8
    },
    {
      id: '2',
      title: 'Document Legal Summary',
      lastMessage: new Date(Date.now() - 86400000),
      preview: 'Please analyze this lease agreement',
      messageCount: 12
    },
    {
      id: '3',
      title: 'Privacy Law Research',
      lastMessage: new Date(Date.now() - 172800000),
      preview: 'Latest updates on data privacy laws',
      messageCount: 6
    },
    {
      id: '4',
      title: 'Intellectual Property Questions',
      lastMessage: new Date(Date.now() - 259200000),
      preview: 'Patent application process',
      messageCount: 15
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        ...(inputValue.toLowerCase().includes('document') || inputValue.toLowerCase().includes('contract') ? {
          documentSummary: {
            title: "Document Analysis Summary",
            summary: "Based on the document provided, I've identified key terms and potential issues that require attention.",
            keyPoints: [
              "Contract term: 2 years with automatic renewal clause",
              "Termination notice period: 30 days required",
              "Non-compete clause applies for 6 months post-termination",
              "Confidentiality obligations extend indefinitely"
            ]
          }
        } : {})
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    if (input.toLowerCase().includes('contract')) {
      return "When reviewing an employment contract, pay special attention to: compensation structure, termination clauses, non-compete agreements, intellectual property rights, and confidentiality provisions. I'd be happy to analyze specific clauses if you share the document.";
    }
    if (input.toLowerCase().includes('document')) {
      return "I can help analyze various legal documents including contracts, agreements, policies, and more. Please upload the document and I'll provide a comprehensive summary with key findings and potential concerns.";
    }
    if (input.toLowerCase().includes('privacy')) {
      return "Recent data privacy regulations include updates to GDPR enforcement, new state privacy laws in California (CPRA), and emerging federal privacy legislation. Would you like me to elaborate on any specific privacy law or jurisdiction?";
    }
    return "I understand your question about legal matters. Based on current legal precedents and regulations, I can provide guidance on this topic. Could you provide more specific details about your situation so I can give you more targeted assistance?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const newChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: "Hello! I'm Sparrow, your legal AI assistant. I can help you with legal questions, analyze documents, and provide research assistance. How can I help you today?",
        timestamp: new Date()
      }
    ]);
    setCurrentSessionId('current');
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-gray-800 border-r border-gray-700 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
                <span className="text-white font-semibold">S</span>
              </div>
              <span className="font-semibold text-white">Sparrow</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            onClick={newChat}
            className="w-full rounded-xl flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white border-0 py-3"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </Button>
        </div>
        
        {/* Chat History */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {chatSessions.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ x: 2 }}
                onClick={() => setCurrentSessionId(session.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentSessionId === session.id 
                    ? 'bg-gray-700 border border-gray-600' 
                    : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate mb-1">
                      {session.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate mb-2">
                      {session.preview}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatRelativeTime(session.lastMessage)}</span>
                      <span>{session.messageCount} messages</span>
                    </div>
                  </div>
                  
                  {/* Session Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 p-0 text-gray-400 hover:text-white"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem className="text-red-400 hover:bg-gray-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Button 
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Button>
          <Button 
            variant="ghost"
            onClick={onBack}
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <h1 className="text-lg font-semibold text-white">
                  {chatSessions.find(s => s.id === currentSessionId)?.title || 'New Chat'}
                </h1>
              </div>
            </div>
            
            {/* User Profile Area */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1 rounded-full hover:bg-gray-700">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-48">
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    <Moon className="w-4 h-4 mr-2" />
                    Dark Mode
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.type === 'user' ? (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-600 text-white text-sm">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">S</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={`rounded-2xl p-4 max-w-full ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800 text-gray-100 border border-gray-700'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        
                        {message.documentSummary && (
                          <Collapsible className="mt-4">
                            <CollapsibleTrigger className="w-full">
                              <Card className="border-dashed border-2 border-gray-600 hover:border-gray-500 transition-colors bg-gray-700">
                                <CardContent className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div className="text-left">
                                      <h4 className="font-medium text-gray-100">{message.documentSummary.title}</h4>
                                      <p className="text-sm text-gray-400">Click to expand summary</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 p-4 bg-gray-700 rounded-xl"
                              >
                                <p className="text-gray-200 mb-3">{message.documentSummary.summary}</p>
                                <div className="space-y-2">
                                  <h5 className="font-medium text-gray-100">Key Points:</h5>
                                  {message.documentSummary.keyPoints.map((point, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                                      <p className="text-sm text-gray-300">{point}</p>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </motion.div>
                      
                      {/* Message Actions */}
                      <div className={`flex items-center space-x-1 mt-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.type === 'ai' && (
                          <div className="flex items-center space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(message.content)}
                              className="w-6 h-6 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-md"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-6 h-6 p-0 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-md"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-6 h-6 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3"
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">S</span>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyPress={handleKeyPress}
                placeholder="Message Sparrow..."
                className="min-h-[52px] max-h-[200px] resize-none rounded-3xl border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 pr-12 py-3 px-4"
                rows={1}
              />
              <div className="absolute right-2 bottom-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white border-0 rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Sparrow can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}