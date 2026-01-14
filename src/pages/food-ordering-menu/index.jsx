import React, { useState, useMemo, useEffect } from 'react';
import BottomTabNavigation from '../../components/navigation/BottomTabNavigation';
import FloatingCartButton from '../../components/navigation/FloatingCartButton';
import BrandLogo from '../../components/navigation/BrandLogo';
import CategoryFilter from './components/CategoryFilter';
import DeliveryInfoCard from './components/DeliveryInfoCard';
import MenuItemCard from './components/MenuItemCard';
import MenuItemDetailModal from './components/MenuItemDetailModal';
import CartModal from './components/CartModal';
import CheckoutSuccessModal from './components/CheckoutSuccessModal';
import BranchSelectionModal from './components/BranchSelectionModal';
import Icon from '../../components/AppIcon';
import { useLocation } from 'react-router-dom';
import menuScraper from '../../services/menu/menuScraper';
import { getApiUrl } from '../../config/api';


const FoodOrderingMenu = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutSuccessOpen, setIsCheckoutSuccessOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState({ orderNumber: '', estimatedTime: '' });
  // Force takeaway only for MVP - delivery removed
  const [orderType, setOrderType] = useState('takeaway');
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [itemComments, setItemComments] = useState({});
  const [menuData, setMenuData] = useState({ nukus: null, mirabad: null });
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Force takeaway only for MVP - delivery removed
  useEffect(() => {
    setOrderType('takeaway');
  }, []);

  // Fetch menu when branch is selected (same menu for both takeaway and delivery)
  useEffect(() => {
    const fetchMenuForBranch = async (branchId) => {
      if (!branchId) return;
      
      // Always fetch menu, even if already loaded, to ensure consistency
      setIsLoadingMenu(true);
      try {
        const menu = await menuScraper.fetchMenu(branchId);
        const transformedMenu = menuScraper.transformMenuData(menu, branchId);
        setMenuData(prev => ({
          ...prev,
          [branchId]: transformedMenu
        }));
      } catch (error) {
        console.error(`Error loading menu for ${branchId}:`, error);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    if (selectedBranch?.id) {
      fetchMenuForBranch(selectedBranch.id);
    }
  }, [selectedBranch?.id]); // Only depend on branch ID, not order type

  // Category names mapping
  const categoryNames = {
    'breakfast': 'Завтраки',
    'special-breakfast': 'Особые Завтраки',
    'bruschettas-sandwiches': 'Брускетты',
    'healthy-eating': 'ПП',
    'salads-appetizers': 'Салаты',
    'soups': 'Супы',
    'main-courses': 'Основное',
    'pasta': 'Гарниры',
    'pizza': 'Пицца',
    'pastries': 'Выпечка',
    'desserts': 'Десерты',
    'coffee': 'Кофе',
    'cold-coffee': 'Холодные Кофе',
    'fresh-juices': 'Фреш',
    'hot-drinks': 'Айс ТИ',
    'lemonades': 'Лимонад',
    'smoothies': 'Смузи',
    'signature-tea': 'Авторские Чаи',
    'leaf-tea': 'Листовые',
    'drinks': 'Софты',
    'additions': 'Дополнительно',
    'alcohol-snacks': 'Закуски к алкогольным напиткам',
    'meat-set': 'Сет мясной',
    'tinctures': 'Домашние настойки',
    'beer': 'Пиво',
    'coffee-alt-milk': 'Кофе на альтернативном молоке',
    'milkshakes': 'Молочные шейки',
    'cocktails': 'Коктейли'
  };

  // Category display order
  const categoryOrder = [
    'breakfast',
    'special-breakfast',
    'additions',
    'bruschettas-sandwiches',
    'healthy-eating',
    'salads-appetizers',
    'alcohol-snacks',
    'soups',
    'main-courses',
    'pasta',
    'meat-set',
    'pizza',
    'pastries',
    'desserts',
    'coffee',
    'coffee-alt-milk',
    'cold-coffee',
    'fresh-juices',
    'hot-drinks',
    'lemonades',
    'smoothies',
    'signature-tea',
    'leaf-tea',
    'drinks',
    'milkshakes',
    'cocktails',
    'tinctures',
    'beer'
  ];


  // Static menus removed to avoid mock data; rely solely on backend-provided menu
  const nukusMenu = [];
  const mirabadMenu = [];

  // Get current menu function - must be defined after nukusMenu and mirabadMenu
  const getCurrentMenu = () => {
    // Menu changes based ONLY on selected branch, NOT on order type (takeaway/delivery)
    // Same branch = same menu, regardless of order type
    if (selectedBranch?.id) {
      const branchMenu = menuData[selectedBranch.id];
      // Use fetched menu if available, otherwise fallback to empty
      if (branchMenu && branchMenu.length > 0) {
        return branchMenu;
      }
      return [];
    }
    // If no branch selected, show empty list until branch picked
    return [];
  };

  // Get categories dynamically from current menu - use actual category names from backend
  const categories = useMemo(() => {
    const currentMenu = getCurrentMenu();
    if (!currentMenu || !Array.isArray(currentMenu)) {
      return [];
    }
    
    // Build a map of category ID -> category name from actual menu items
    const categoryMap = new Map();
    currentMenu.forEach(item => {
      if (item?.category) {
        // Use original category name if available, otherwise fallback to mapped name
        const categoryName = item.categoryName || categoryNames[item.category] || item.category;
        categoryMap.set(item.category, categoryName);
      }
    });
    
    const uniqueCategories = Array.from(categoryMap.keys());
    
    // Create category list (removed "Все" category) sorted by custom order
    const categoryList = uniqueCategories
      .filter(catId => categoryOrder.includes(catId)) // Only include categories in our order
      .sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        return indexA - indexB;
      })
      .map(catId => ({
        id: catId,
        name: categoryMap.get(catId) || categoryNames[catId] || catId
      }));
    
    return categoryList;
  }, [selectedBranch, menuData]);

  const filteredMenuItems = useMemo(() => {
    const currentMenu = getCurrentMenu();
    if (!currentMenu || !Array.isArray(currentMenu)) {
      return [];
    }
    if (!activeCategory) {
      return currentMenu;
    }
    return currentMenu?.filter((item) => item?.category === activeCategory);
  }, [activeCategory, selectedBranch, menuData]);

  const cartCount = cartItems?.reduce((sum, item) => sum + item?.quantity, 0);
  const cartTotal = cartItems?.reduce((sum, item) => sum + item?.price * item?.quantity, 0);

  const handleAddToCart = (item, quantity) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems?.find((cartItem) => cartItem?.id === item?.id);
      if (existingItem) {
        return prevItems?.map((cartItem) =>
        cartItem?.id === item?.id ?
        { ...cartItem, quantity: cartItem?.quantity + quantity } :
        cartItem
        );
      }
      return [...prevItems, { ...item, quantity }];
    });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems((prevItems) =>
    prevItems?.map((item) =>
    item?.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prevItems) => prevItems?.filter((item) => item?.id !== itemId));
  };

  const handleCheckout = async (comments) => {
    const orderNumber = `BEN${Date.now()?.toString()?.slice(-6)}`;
    const estimatedTime = orderType === 'takeaway' ? '15-20 мин' : '30-45 мин';
    
    // Include comments in order details
    const orderComments = comments || itemComments;
    setOrderDetails({ 
      orderNumber, 
      estimatedTime,
      branch: selectedBranch,
      comments: orderComments
    });
    
    // Send order notification to Telegram (for takeaway orders)
    if (orderType === 'takeaway' && selectedBranch) {
      try {
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        
        // Get customer info from localStorage/auth if available
        const token = localStorage.getItem('authToken');
        let customerPhone = null;
        let customerName = null;
        
        if (token) {
          try {
        const response = await fetch(getApiUrl('customers/me'), {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.customer) {
                customerPhone = data.customer.phone;
                customerName = `${data.customer.name || ''} ${data.customer.surName || ''}`.trim() || null;
              }
            }
          } catch (error) {
            console.error('Error fetching customer info:', error);
          }
        }
        
        const orderData = {
          orderNumber,
          branch: selectedBranch,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount,
          comments: orderComments,
          customerPhone,
          customerName
        };
        
        const response = await fetch(getApiUrl('orders/takeaway'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
          console.log('✅ Order notification sent to Telegram');
        } else {
          console.error('❌ Failed to send order notification:', await response.text());
        }
      } catch (error) {
        console.error('Error sending order notification:', error);
        // Don't block checkout if Telegram notification fails
      }
    }
    
    setIsCartModalOpen(false);
    setIsCheckoutSuccessOpen(true);
    setCartItems([]);
    setItemComments({});
  };

  // Order type is always takeaway for MVP
  const handleOrderTypeSelect = (type) => {
    if (type === 'takeaway') {
      setOrderType('takeaway');
    }
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setIsBranchModalOpen(false);
  };

  const handleTakeawayClick = () => {
    // Removed automatic modal opening - user will select branch manually
  };

  const handleItemCommentChange = (itemId, comment) => {
    setItemComments(prev => ({
      ...prev,
      [itemId]: comment
    }));
  };

  const getCartQuantity = (itemId) => {
    const cartItem = cartItems?.find((item) => item?.id === itemId);
    return cartItem ? cartItem?.quantity : 0;
  };

  const handleMenuItemClick = (item) => {
    setSelectedMenuItem(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMenuItem(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="main-content max-w-md mx-auto">
        <div className="mb-6">
          <BrandLogo />
        </div>

        <DeliveryInfoCard 
          onOrderTypeSelect={handleOrderTypeSelect}
          defaultOrderType={orderType}
          onTakeawayClick={handleTakeawayClick}
          onBranchSelect={() => setIsBranchModalOpen(true)}
          selectedBranch={selectedBranch}
        />

        {selectedBranch && (
          <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={16} className="text-accent" />
                <div>
                <p className="text-xs text-muted-foreground">
                  Филиал для самовывоза:
                </p>
                  <p className="text-sm font-semibold text-foreground">{selectedBranch?.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Show menu only if branch is selected - works for both takeaway and delivery */}
        {selectedBranch ? (
          <>
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory} />
        </div>

            {isLoadingMenu ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-accent mb-4" />
                <p className="text-muted-foreground">Загрузка меню...</p>
              </div>
            ) : (
        <div className="grid grid-cols-1 gap-4 pb-4">
                {filteredMenuItems?.length > 0 ? (
                  filteredMenuItems?.map((item) => (
            <MenuItemCard
              key={item?.id}
              item={item}
              onAddToCart={handleAddToCart}
              cartQuantity={getCartQuantity(item?.id)}
              onItemClick={handleMenuItemClick}
            />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Меню для этого филиала пока не загружено.</p>
                    <p className="text-sm mt-2">Используется базовое меню.</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="MapPin" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Выберите филиал</p>
            <p className="text-sm">Для просмотра меню необходимо выбрать филиал</p>
            <p className="text-xs mt-2 text-muted-foreground/70">
              Выберите филиал для самовывоза
            </p>
        </div>
        )}
      </div>
      <BottomTabNavigation cartCount={cartCount} />
      {cartCount > 0 &&
      <FloatingCartButton
        cartCount={cartCount}
        onClick={() => setIsCartModalOpen(true)} />

      }
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        onItemCommentChange={handleItemCommentChange} />

      <CheckoutSuccessModal
        isOpen={isCheckoutSuccessOpen}
        onClose={() => setIsCheckoutSuccessOpen(false)}
        orderNumber={orderDetails?.orderNumber}
        estimatedTime={orderDetails?.estimatedTime} />

      <BranchSelectionModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        onBranchSelect={handleBranchSelect} />

      <MenuItemDetailModal
        item={selectedMenuItem}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onAddToCart={handleAddToCart}
      />
    </div>);

};

export default FoodOrderingMenu;