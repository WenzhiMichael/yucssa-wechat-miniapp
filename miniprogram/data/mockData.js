const categories = [
    { id: '1', name: 'Restaurants', icon: '/assets/icons/food.png', color: '#FF7F50' },
    { id: '2', name: 'Bubble Tea', icon: '/assets/icons/tea.png', color: '#87CEFA' },
    { id: '3', name: 'Entertainment', icon: '/assets/icons/fun.png', color: '#DA70D6' },
    { id: '4', name: 'Services', icon: '/assets/icons/service.png', color: '#90EE90' }
];

const merchants = [
    {
        id: '101',
        categoryId: '1',
        name: 'Dragon Legend',
        logo: 'https://via.placeholder.com/150/C1272D/FFFFFF?text=DL',
        banner: 'https://via.placeholder.com/600x300/333333/FFFFFF?text=Dragon+Legend+Dining',
        address: '1500 Steeles Ave E, Markham',
        phone: '(905) 123-4567',
        description: 'Premier Chinese buffet offering a wide range of authentic dishes including dim sum, seafood, and BBQ.',
        discount: '10% OFF for YUCSSA members (Cash Only)'
    },
    {
        id: '102',
        categoryId: '2',
        name: 'The Alley',
        logo: 'https://via.placeholder.com/150/000000/FFFFFF?text=Alley',
        banner: 'https://via.placeholder.com/600x300/CCCCCC/000000?text=The+Alley+Tea',
        address: '5095 Yonge St, North York',
        phone: '(647) 987-6543',
        description: 'Famous for our Brown Sugar Deerioca Series. We serve high-quality tea beverages with aesthetic presentation.',
        discount: 'Buy 1 Get 1 Free on Select Drinks'
    },
    {
        id: '103',
        categoryId: '3',
        name: 'Cineplex VIP',
        logo: 'https://via.placeholder.com/150/003366/FFFFFF?text=VIP',
        banner: 'https://via.placeholder.com/600x300/000066/FFFFFF?text=Movie+Experience',
        address: '1000 Highway 7, Markham',
        phone: '(905) 555-1212',
        description: 'Experience movies like never before with VIP service, comfortable seating, and in-seat dining.',
        discount: 'Student Price: $12.99 on Tuesdays'
    },
    {
        id: '104',
        categoryId: '4',
        name: 'Top Barber',
        logo: 'https://via.placeholder.com/150/663300/FFFFFF?text=Barber',
        banner: 'https://via.placeholder.com/600x300/332211/FFFFFF?text=Professional+Cuts',
        address: '200 Main St, Unionville',
        phone: '(905) 222-3333',
        description: 'Professional grooming services for men. Haircuts, shaves, and styling.',
        discount: '15% OFF for first-time visits'
    }
];

module.exports = {
    categories,
    merchants
};
