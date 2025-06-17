import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/Card';
import ManagerResponse from '../../components/ManagerResponse';
import api from '../../utils/api';

const ManagerResponsesPage = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const response = await api.get('/api/manager-responses');
            setResponses(response.data);
        } catch (error) {
            console.error('Error fetching responses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveResponse = async (responseId, newText) => {
        try {
            await api.put(`/api/manager-responses/${responseId}`, { text: newText });
            fetchResponses(); // Перезагружаем список
        } catch (error) {
            console.error('Error saving response:', error);
        }
    };

    const handleDeleteResponse = async (responseId) => {
        try {
            await api.delete(`/api/manager-responses/${responseId}`);
            fetchResponses(); // Перезагружаем список
        } catch (error) {
            console.error('Error deleting response:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-white mb-8">Ответы менеджеров</h1>
                
                <div className="space-y-6">
                    {responses.map((response) => (
                        <ManagerResponse
                            key={response.id}
                            response={response}
                            isEditable={true}
                            onSave={(newText) => handleSaveResponse(response.id, newText)}
                            onDelete={() => handleDeleteResponse(response.id)}
                        />
                    ))}
                    
                    {responses.length === 0 && (
                        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                            <CardContent className="p-6 text-center">
                                <p className="text-white/60">Нет доступных ответов</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ManagerResponsesPage; 