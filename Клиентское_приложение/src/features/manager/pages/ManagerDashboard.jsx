import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/Card';
import { MessageSquare, Star, Clock, CheckCircle2, AlertCircle, Filter, Search, MapPin } from 'lucide-react';
import api from '../../utils/api';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../../config';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RatingCriteria } from '../../restaurants/components/RatingCriteria';
import EnhancedManagerDashboard from '../ManagerDashboard';

const ManagerDashboard = () => {
    // Use the enhanced version of the dashboard
    return <EnhancedManagerDashboard />;
};

export default ManagerDashboard; 