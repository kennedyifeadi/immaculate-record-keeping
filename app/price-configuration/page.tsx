import { getProducts } from '@/actions/product-actions';
import PriceConfigClient from './PriceConfigClient';

export default async function PriceConfigurationPage() {
  const products = await getProducts();
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Price Configuration</h1>
        <p className="text-slate-500 text-sm">Manage product cost and selling prices.</p>
      </div>
      <PriceConfigClient initialProducts={products} />
    </div>
  );
}
