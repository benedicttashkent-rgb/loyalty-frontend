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
import { useNavigate } from 'react-router-dom';
import menuScraper from '../../services/menu/menuScraper';
import { getApiUrl } from '../../config/api';


const FoodOrderingMenu = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutSuccessOpen, setIsCheckoutSuccessOpen] = useState(false);
  // Load order details from localStorage on mount
  const [orderDetails, setOrderDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('benedictOrderDetails');
      return saved ? JSON.parse(saved) : { orderNumber: '', estimatedTime: '', branch: null, comments: {} };
    } catch {
      return { orderNumber: '', estimatedTime: '', branch: null, comments: {} };
    }
  });
  const [orderType, setOrderType] = useState('takeaway');
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  // Load selected branch from localStorage on mount
  const [selectedBranch, setSelectedBranch] = useState(() => {
    try {
      const saved = localStorage.getItem('benedictSelectedBranch');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [itemComments, setItemComments] = useState({});
  const [menuData, setMenuData] = useState({ nukus: null, mirabad: null });
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Save selected branch to localStorage when it changes
  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem('benedictSelectedBranch', JSON.stringify(selectedBranch));
    } else {
      localStorage.removeItem('benedictSelectedBranch');
    }
  }, [selectedBranch]);

  // Fetch menu when branch is selected (same menu for both takeaway and delivery)
  useEffect(() => {
    const fetchMenuForBranch = async (branchId) => {
      if (!branchId) return;
      
      // Always fetch menu, even if already loaded, to ensure consistency
      setIsLoadingMenu(true);
      try {
        const menu = await menuScraper.fetchMenu(branchId);
        const transformedMenu = menuScraper.transformMenuData(menu);
        setMenuData(prev => ({
          ...prev,
          [branchId]: transformedMenu
        }));
        // Set default category to 'breakfast' when branch is selected
        setActiveCategory('breakfast');
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
    
    let filtered = currentMenu;
    
    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter((item) => item?.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const name = (item?.name || '').toLowerCase();
        const description = (item?.description || '').toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }
    
    return filtered;
  }, [activeCategory, selectedBranch, menuData, searchQuery]);

  const cartCount = cartItems?.reduce((sum, item) => sum + item?.quantity, 0);
  const cartTotal = cartItems?.reduce((sum, item) => {
    const basePrice = item?.price || 0;
    const modifierPrice = item?.selectedModifier?.price || 0;
    return sum + ((basePrice + modifierPrice) * item?.quantity);
  }, 0);

  const handleAddToCart = (item, quantity, selectedModifier = null) => {
    setCartItems((prevItems) => {
      // Create a unique cart item ID that includes modifier if present
      const cartItemId = selectedModifier 
        ? `${item?.id}-mod-${selectedModifier.id}`
        : item?.id;
      
      // Check if exact same item with same modifier already exists
      const existingItem = prevItems?.find((cartItem) => {
        const existingId = cartItem?.cartItemId || cartItem?.id;
        return existingId === cartItemId;
      });

      if (existingItem) {
        // Increment quantity of existing item
        return prevItems?.map((cartItem) => {
          const existingId = cartItem?.cartItemId || cartItem?.id;
          return existingId === cartItemId
            ? { ...cartItem, quantity: cartItem?.quantity + quantity }
            : cartItem;
        });
      }
      
      // Add new item with modifier and unique cart ID
      return [...prevItems, { 
        ...item, 
        quantity,
        selectedModifier: selectedModifier || null,
        cartItemId: cartItemId // Store unique ID for easy lookup
      }];
    });
  };

  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    setCartItems((prevItems) =>
    prevItems?.map((item) => {
      const itemId = item?.cartItemId || item?.id;
      return itemId === cartItemId ? { ...item, quantity: newQuantity } : item;
    })
    );
  };

  const handleRemoveItem = (cartItemId) => {
    setCartItems((prevItems) => prevItems?.filter((item) => {
      const itemId = item?.cartItemId || item?.id;
      return itemId !== cartItemId;
    }));
  };

  const handleCheckout = async (comments) => {
    const orderNumber = `BEN${Date.now()?.toString()?.slice(-6)}`;
    const estimatedTime = orderType === 'takeaway' ? '15-20 мин' : '30-45 мин';

    const orderComments = comments || itemComments;

    if (selectedBranch) {
      const totalAmount = cartItems.reduce((sum, item) => {
        const basePrice = item?.price || 0;
        const modifierPrice = item?.selectedModifier?.price || 0;
        return sum + ((basePrice + modifierPrice) * (item?.quantity || 1));
      }, 0);

      let customerPhone = null;
      let customerName = null;

      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const meRes = await fetch(getApiUrl('customers/me'), {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (meRes.ok) {
            const data = await meRes.json();
            if (data.success && data.customer) {
              customerPhone = data.customer.phone;
              customerName = `${data.customer.name || ''} ${data.customer.surName || ''}`.trim() || null;
            }
          }
        } catch (e) {
          console.error('Error fetching customer info:', e);
        }
      }

      const orderData = {
        orderNumber,
        branch: selectedBranch,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          modifier: item.selectedModifier ? {
            id: item.selectedModifier.id,
            name: item.selectedModifier.name,
            price: item.selectedModifier.price || 0
          } : null
        })),
        totalAmount,
        comments: orderComments,
        customerPhone,
        customerName
      };

      const response = await fetch(getApiUrl('orders/takeaway'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = 'Не удалось отправить заказ';
        try {
          const errJson = JSON.parse(errText);
          if (errJson?.error) errMsg = errJson.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      console.log('✅ Order sent to backend');
    }

    const newOrderDetails = {
      orderNumber,
      estimatedTime,
      branch: selectedBranch,
      comments: orderComments,
      status: 'NEW',
      orderType,
      deliveryAddress: deliveryAddress?.address || null
    };

    setOrderDetails(newOrderDetails);
    localStorage.setItem('benedictOrderDetails', JSON.stringify(newOrderDetails));
    setIsCartModalOpen(false);
    setIsCheckoutSuccessOpen(true);
    setCartItems([]);
    setItemComments({});
  };

  const handleOrderTypeSelect = (type) => {
    setOrderType(type);
    if (type === 'takeaway') {
      setDeliveryAddress(null);
    }
  };

  const handleDeliveryAddressChange = (address) => {
    setDeliveryAddress(address);
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    // Save to localStorage is handled by useEffect
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

  const handleProceedToCheckout = (comments) => {
    if (orderType === 'takeaway' && !selectedBranch) return;
    if (orderType === 'delivery' && !deliveryAddress?.address) return;
    const mergedComments = { ...itemComments, ...comments };
    setIsCartModalOpen(false);
    navigate('/checkout', {
      state: { cartItems, selectedBranch, itemComments: mergedComments, orderType, deliveryAddress }
    });
  };

  const getCartQuantity = (itemId) => {
    // Sum quantities for all cart items with this base item ID (including different modifiers)
    return cartItems
      ?.filter((item) => item?.id === itemId)
      ?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0;
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
    <div className="min-h-screen bg-background relative">
      {/* Under Development Overlay */}
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm pointer-events-auto select-none">
        <img
          src="/mascot-dev.webp"
          alt="Under Development"
          className="w-64 h-auto drop-shadow-lg"
          draggable={false}
        />
        <h1 className="mt-6 text-2xl font-bold text-gray-800 tracking-tight">Скоро открытие!</h1>
        <p className="mt-2 text-gray-500 text-center max-w-xs text-sm">
          Онлайн-заказ временно недоступен. Мы работаем над этим — совсем скоро всё будет готово!
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-medium active:scale-95 transition-transform"
        >
          Вернуться на главную
        </button>
      </div>
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
          onDeliveryAddressChange={handleDeliveryAddressChange}
        />

        {/* Show menu only if branch is selected - works for both takeaway and delivery */}
        {selectedBranch ? (
          <>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Icon
              name="Search"
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-card border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 shadow-sm transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ touchAction: 'manipulation' }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors cursor-pointer"
                aria-label="Очистить поиск"
              >
                <Icon name="X" size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={(cat) => {
              setActiveCategory(cat);
              setSearchQuery(''); // Clear search when changing category
            }} />
        </div>

            {isLoadingMenu ? (
              <div className="space-y-3 pb-24">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border/60 p-3 flex gap-3 animate-pulse">
                    <div className="w-[88px] h-[88px] rounded-xl bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3.5 bg-muted rounded-full w-3/4" />
                      <div className="h-3 bg-muted rounded-full w-full" />
                      <div className="h-3 bg-muted rounded-full w-2/3" />
                      <div className="h-3 bg-muted rounded-full w-1/2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 pb-24">
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
                  <div className="flex flex-col items-center text-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <Icon name="Search" size={22} className="text-muted-foreground/60" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Ничего не найдено</p>
                    <p className="text-xs text-muted-foreground mb-3">Попробуйте другой запрос или категорию</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{ touchAction: 'manipulation' }}
                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        Сбросить поиск
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Icon name="Store" size={28} className="text-muted-foreground/60" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">Выберите филиал</p>
            <p className="text-sm text-muted-foreground mb-5">Выберите ближайший филиал, чтобы увидеть меню</p>
            <button
              onClick={() => setIsBranchModalOpen(true)}
              style={{ touchAction: 'manipulation' }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-primary/90 active:scale-95 cursor-pointer"
            >
              <Icon name="MapPin" size={15} />
              Выбрать филиал
            </button>
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
        selectedBranch={selectedBranch}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        onProceedToCheckout={handleProceedToCheckout}
        onItemCommentChange={handleItemCommentChange}
        orderType={orderType}
        deliveryAddress={deliveryAddress} />

      <CheckoutSuccessModal
        isOpen={isCheckoutSuccessOpen}
        onClose={() => setIsCheckoutSuccessOpen(false)}
        orderNumber={orderDetails?.orderNumber}
        estimatedTime={orderDetails?.estimatedTime}
      />

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