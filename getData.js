const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// חיפוש לקוח לפי טלפון/מייל/מספר הזמנה
const searchCustomer = async (req, res) => {
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  const searchTerm = req.params.searchTerm;
  try {
    // חיפוש לקוח לפי טלפון או מייל
    let { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .or(`phone.eq.${searchTerm},email.eq.${searchTerm}`)
      .single();
    
    // אם לא נמצא לפי טלפון/מייל, ננסה לפי מספר הזמנה
    if (customerError && !isNaN(searchTerm)) {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('customerid')
        .eq('orderid', parseInt(searchTerm))
        .single();
      
      if (!orderError && orderData) {
        const { data: customerByOrder, error: customerByOrderError } = await supabase
          .from('customers')
          .select('*')
          .eq('customerid', orderData.customerid)
          .single();
        
        if (!customerByOrderError) {
          customer = customerByOrder;
        }
      }
    }
    
    if (!customer) {
      return res.status(404).json({ error: 'לא נמצא לקוח' });
    }
    
    // שליפת הזמנות ומוצרים
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        orderid,
        orderdate,
        orderproducts (
          orderproductid,
          finalweight,
          paidprice,
          didnt_get,
          products (
            productname,
            avgweight,
            priceperkg
          )
        )
      `)
      .eq('customerid', customer.customerid)
      .order('orderdate', { ascending: false });
    
    if (ordersError) {
      return res.status(500).json({ error: 'שגיאה בשליפת הזמנות' });
    }
    
    // עיצוב הנתונים
    const formattedOrders = orders.map(order => ({
      orderid: order.orderid,
      orderdate: order.orderdate,
      products: order.orderproducts.map(op => ({
        orderproductid: op.orderproductid,
        productname: op.products.productname,
        avgweight: op.products.avgweight,
        priceperkg: op.products.priceperkg,
        finalweight: op.finalweight,
        paidprice: op.paidprice,
        notreceived: op.didnt_get
      }))
    }));
    
    res.json({
      customer,
      orders: formattedOrders
    });
    
  } catch (err) {
    console.error('שגיאה בחיפוש לקוח:', err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// עדכון משקל סופי וסטטוס לא קבלתי
const updateWeight = async (req, res) => {
  console.log("saving whsigsd");
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  const { orderProductId, finalWeight, notReceived } = req.body;
  
  if (!orderProductId || !finalWeight) {
    return res.status(400).json({ error: 'חסרים פרמטרים' });
  }
  
  try {
    const { data, error } = await supabase
      .from('orderproducts')
      .update({ 
        finalweight: finalWeight,
        didnt_get: notReceived || false,
        updatedat: new Date().toISOString()
      })
      .eq('orderproductid', orderProductId)
      .select();
    
    if (error) {
      return res.status(500).json({ error: 'שגיאה בעדכון: ' + error.message });
    }
    
    res.json({ message: 'נתונים עודכנו בהצלחה', data });
    
  } catch (err) {
    res.status(500).json({ error: 'שגיאת שרת: ' + err.message });
  }
};

module.exports = { searchCustomer, updateWeight };