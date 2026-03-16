'use client'

import { useState, useTransition, useEffect } from 'react';
import { updateProduct, addProduct } from '@/actions/product-actions';
import { Search, Plus, Save, X, Calculator } from 'lucide-react';

export default function PriceConfigClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', code: '', costPrice: 0, sellingPrice: 0 });

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePriceChange = (id: string, field: 'costPrice' | 'sellingPrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    setProducts(prev => prev.map(p => 
      p._id === id ? { ...p, [field]: numValue } : p
    ));
  };

  const handleSaveRow = (id: string) => {
    const product = products.find(p => p._id === id);
    if (!product) return;

    setSavingId(id);
    startTransition(async () => {
      const res = await updateProduct(id, {
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice
      });
      setSavingId(null);
      if (!res.success) {
        alert("Failed to update product");
      }
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.code) return;

    startTransition(async () => {
      const res = await addProduct(newProduct);
      if (res.success) {
        setIsAddModalOpen(false);
        setNewProduct({ name: '', code: '', costPrice: 0, sellingPrice: 0 });
        // Next.js will revalidate and update initialProducts via Server Component
      } else {
        alert("Failed to add product");
      }
    });
  };

  const isRowDirty = (current: any) => {
    const original = initialProducts.find(p => p._id === current._id);
    if (!original) return false;
    return current.costPrice !== original.costPrice || current.sellingPrice !== original.sellingPrice;
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search products by name or code..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Cost Price</th>
              <th className="px-6 py-4">Selling Price</th>
              <th className="px-6 py-4">Profit</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No products found matching &quot;{searchTerm}&quot;
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const profit = product.sellingPrice - product.costPrice;
                const dirty = isRowDirty(product);
                const isSaving = savingId === product._id;

                return (
                  <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">
                        {product.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        step="0.01"
                        value={product.costPrice}
                        onChange={(e) => handlePriceChange(product._id, 'costPrice', e.target.value)}
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-right focus:ring-2 focus:ring-blue-500/20"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        step="0.01"
                        value={product.sellingPrice}
                        onChange={(e) => handlePriceChange(product._id, 'sellingPrice', e.target.value)}
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-right focus:ring-2 focus:ring-blue-500/20"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      <span className={profit > 0 ? "text-green-600" : profit < 0 ? "text-red-600" : "text-slate-400"}>
                        ₦{profit.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {dirty && (
                        <button
                          onClick={() => handleSaveRow(product._id)}
                          disabled={isSaving}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1 font-medium"
                          title="Save Changes"
                        >
                          <Save size={18} />
                          <span className="text-xs">{isSaving ? '...' : 'Save'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add New Product</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Large Super"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Code</label>
                <input
                  type="text"
                  value={newProduct.code}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono"
                  placeholder="e.g., LS"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProduct}
                disabled={isPending || !newProduct.name || !newProduct.code}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
