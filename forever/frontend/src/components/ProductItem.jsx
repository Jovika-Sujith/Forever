import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext); 

  const productImage = Array.isArray(image) && image.length > 0
    ? image[0]
    : typeof image === 'string' && image
      ? image
      : 'https://via.placeholder.com/400x500?text=No+Image';

  return (
    <Link className='text-gray-700 cursor-pointer' to={id ? `/product/${id}` : '#'}>
      <div className='overflow-hidden'>
        <img className='hover:scale-110 transition ease-in-out' src={productImage} alt={name || "Product"} />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name || "No Name"}</p>
      <p className='text-sm font-medium'>{currency ? currency + price : "Price Not Available"}</p>
    </Link>
  );
};

export default ProductItem;
