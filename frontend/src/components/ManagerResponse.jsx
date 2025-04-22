import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './Card';
import { Send, Edit2, Trash2 } from 'lucide-react';

const buttonVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    hover: {
        scale: 1.05,
        transition: { 
            duration: 0.2,
            type: "spring", 
            stiffness: 400 
        }
    },
    tap: {
        scale: 0.95,
        transition: { 
            duration: 0.1 
        }
    }
};

const ManagerResponse = ({ 
    response, 
    onEdit, 
    onDelete, 
    isEditable = false,
    onSave 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(response?.text || '');

    const handleSave = () => {
        onSave(editedText);
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
        >
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {isEditing ? (
                                <textarea
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    className="w-full p-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    rows={4}
                                />
                            ) : (
                                <p className="text-white text-lg">{response?.text}</p>
                            )}
                            <p className="text-white/60 text-sm mt-2">
                                Ответ от менеджера • {response?.date}
                            </p>
                        </div>
                        
                        {isEditable && (
                            <div className="flex gap-2 ml-4">
                                {isEditing ? (
                                    <motion.button
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleSave}
                                        className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg"
                                    >
                                        <Send className="w-5 h-5 text-green-400" />
                                    </motion.button>
                                ) : (
                                    <>
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => setIsEditing(true)}
                                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg"
                                        >
                                            <Edit2 className="w-5 h-5 text-blue-400" />
                                        </motion.button>
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={onDelete}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-400" />
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ManagerResponse; 