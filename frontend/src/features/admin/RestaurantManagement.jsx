import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import api from '../../utils/api';

const RestaurantManagement = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        price_range: '',
        image_url: '',
        address: '',
        contact_phone: '',
        hours: '',
        website: '',
        description: ''
    });

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/admin/restaurants');
            setRestaurants(response.data.restaurants);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            // Здесь можно добавить уведомление об ошибке
        }
    };

    const handleOpen = (restaurant = null) => {
        if (restaurant) {
            setEditingRestaurant(restaurant);
            setFormData(restaurant);
        } else {
            setEditingRestaurant(null);
            setFormData({
                name: '',
                cuisine: '',
                price_range: '',
                image_url: '',
                address: '',
                contact_phone: '',
                hours: '',
                website: '',
                description: ''
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingRestaurant(null);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRestaurant) {
                await api.put(`/api/admin/restaurants/${editingRestaurant.id}`, formData);
            } else {
                await api.post('/api/admin/restaurants', formData);
            }
            fetchRestaurants();
            handleClose();
        } catch (error) {
            console.error('Error saving restaurant:', error);
            // Здесь можно добавить уведомление об ошибке
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/admin/restaurants/${id}`);
            fetchRestaurants();
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            // Здесь можно добавить уведомление об ошибке
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Управление ресторанами
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                    >
                        Добавить ресторан
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Название</TableCell>
                                <TableCell>Кухня</TableCell>
                                <TableCell>Ценовой диапазон</TableCell>
                                <TableCell>Адрес</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {restaurants.map((restaurant) => (
                                <TableRow key={restaurant.id}>
                                    <TableCell>{restaurant.name}</TableCell>
                                    <TableCell>{restaurant.cuisine}</TableCell>
                                    <TableCell>{restaurant.price_range}</TableCell>
                                    <TableCell>{restaurant.address}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpen(restaurant)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(restaurant.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                    <DialogTitle>
                        {editingRestaurant ? 'Редактировать ресторан' : 'Добавить ресторан'}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Название"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Кухня"
                                    name="cuisine"
                                    value={formData.cuisine}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Ценовой диапазон"
                                    name="price_range"
                                    value={formData.price_range}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="URL изображения"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Адрес"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Телефон"
                                    name="contact_phone"
                                    value={formData.contact_phone}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Часы работы"
                                    name="hours"
                                    value={formData.hours}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Веб-сайт"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Описание"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Отмена</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            {editingRestaurant ? 'Сохранить' : 'Добавить'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default RestaurantManagement; 