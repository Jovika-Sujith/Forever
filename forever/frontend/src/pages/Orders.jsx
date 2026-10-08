import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';


const Orders = () => {
  const {backendUrl, token, currency} = useContext(ShopContext);

  const [orders, setOrders] = useState([]);

  const loadOrderData = async () => {
    try{
      if(!token){
        return null
      }
      const response = await axios.post(backendUrl + '/api/order/userOrders', {}, {headers: {token}})
      if(response.data.success){
        // Keep orders grouped (not flattened) so each order can show its own
        // items, total, and address together -- needed for a proper printable bill.
        setOrders(response.data.orders.reverse())
      }
    }
    catch(error){
      console.log(error)
    }
  }

  useEffect(()=>{
    loadOrderData()
  }, [token])

  const printBill = (order) => {
    const itemRows = order.items.map((item) =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;">${item.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;">${item.size}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;">${currency}${item.price}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #ddd;text-align:right;">${currency}${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('');

    const receiptHtml = `
      <html>
        <head>
          <title>Order Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a2e; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .meta { color: #555; font-size: 13px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; padding: 6px 8px; border-bottom: 2px solid #333; font-size: 12px; text-transform: uppercase; }
            .total-row td { font-weight: bold; padding-top: 10px; border-top: 2px solid #333; }
            .address { margin-top: 16px; font-size: 13px; color: #333; }
          </style>
        </head>
        <body>
          <h1>Order Receipt</h1>
          <div class="meta">
            Order ID: ${order._id}<br/>
            Date: ${new Date(order.date).toLocaleString()}<br/>
            Payment Method: ${order.paymentMethod}<br/>
            Status: ${order.status}
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
              <tr class="total-row">
                <td colspan="4">Total</td>
                <td style="text-align:right;">${currency}${order.amount}</td>
              </tr>
            </tbody>
          </table>
          <div class="address">
            <strong>Delivery Address</strong><br/>
            ${order.address?.firstName || ''} ${order.address?.lastName || ''}<br/>
            ${order.address?.street || ''}<br/>
            ${order.address?.city || ''}, ${order.address?.state || ''} ${order.address?.zipcode || ''}<br/>
            ${order.address?.country || ''}<br/>
            ${order.address?.phone || ''}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=700,height=800');
    if (!printWindow) {
      alert('Please allow pop-ups to print the bill.');
      return;
    }
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1 = {'MY'} text2 = {'ORDERS'}/>
      </div>
      <div>
        {orders.length === 0 && (
          <p className='py-8 text-gray-500 text-sm'>You have no orders yet.</p>
        )}
        {orders.map((order, orderIndex)=>(
          <div key={order._id || orderIndex} className='py-4 border-b text-gray-700'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3'>
              <div className='text-sm text-gray-500'>
                Order placed: {new Date(order.date).toDateString()} &middot; Total: {currency}{order.amount} &middot; {order.paymentMethod}
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                  <p className='text-sm md:text-base'>{order.status}</p>
                </div>
                <button onClick={() => printBill(order)} className='border px-4 py-2 text-sm font-medium rounded-sm'>
                  Print Bill
                </button>
              </div>
            </div>
            {order.items.map((item, itemIndex)=>(
              <div key={itemIndex} className='flex items-start gap-6 text-sm py-2'>
                <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
                <div>
                  <p className='sm:text-base font-medium'>{item.name}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders;
