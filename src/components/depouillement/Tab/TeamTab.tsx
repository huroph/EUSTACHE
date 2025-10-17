import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, X, Trash2, GripVertical } from 'lucide-react';

interface DepouillementItem {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
}

interface SequenceItem {
    id: string;
    item_id: string;
    quantity: number;
    notes: string | null;
    item: DepouillementItem;
}

interface TeamTabProps {
    sequenceId: string | null;
    sequenceName: string;
    categoryId: string;
    categoryName: string;
}

export function TeamTab({ sequenceId, sequenceName, categoryId, categoryName }: TeamTabProps) {
    const [allItems, setAllItems] = useState<DepouillementItem[]>([]);
    const [sequenceItems, setSequenceItems] = useState<SequenceItem[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    useEffect(() => {
        loadCategoryItems();
    }, [categoryId]);

    useEffect(() => {
        if (sequenceId) {
            loadSequenceItems();
        }
    }, [sequenceId, categoryId]);

    const loadCategoryItems = async () => {
        const { data } = await supabase
            .from('depouillement_items')
            .select('*')
            .eq('category_id', categoryId)
            .order('name');

        if (data) setAllItems(data);
    };

    const loadSequenceItems = async () => {
        if (!sequenceId) return;

        const { data } = await supabase
            .from('sequence_depouillement')
            .select(`
        id,
        item_id,
        quantity,
        notes,
        item:depouillement_items(*)
      `)
            .eq('sequence_id', sequenceId)
            .eq('item.category_id', categoryId);

        if (data) {
            const filtered = data.filter((si: any) => si.item?.category_id === categoryId);
            setSequenceItems(filtered as any);
        }
    };

    const handleDragStart = (itemId: string) => {
        setDraggedItem(itemId);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDropToSequence = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedItem || !sequenceId) return;

        // Vérifier si l'item n'est pas déjà dans la séquence
        const alreadyInSequence = sequenceItems.some(si => si.item_id === draggedItem);
        if (alreadyInSequence) {
            setDraggedItem(null);
            return;
        }

        const { data } = await supabase
            .from('sequence_depouillement')
            .insert({
                sequence_id: sequenceId,
                item_id: draggedItem,
                quantity: 1,
                notes: null,
            })
            .select(`
        id,
        item_id,
        quantity,
        notes,
        item:depouillement_items(*)
      `)
            .single();

        if (data) {
            setSequenceItems([...sequenceItems, data as any]);
        }
        setDraggedItem(null);
    };

    const removeItemFromSequence = async (id: string) => {
        if (!confirm('Retirer ce membre de la séquence ?')) return;

        await supabase.from('sequence_depouillement').delete().eq('id', id);
        setSequenceItems(sequenceItems.filter(si => si.id !== id));
    };

    const updateQuantity = async (id: string, quantity: number) => {
        const { data } = await supabase
            .from('sequence_depouillement')
            .update({ quantity })
            .eq('id', id)
            .select(`
        id,
        item_id,
        quantity,
        notes,
        item:depouillement_items(*)
      `)
            .single();

        if (data) {
            setSequenceItems(sequenceItems.map(si => si.id === id ? data as any : si));
        }
    };

    const updateNotes = async (id: string, notes: string | null) => {
        const { data } = await supabase
            .from('sequence_depouillement')
            .update({ notes })
            .eq('id', id)
            .select(`
        id,
        item_id,
        quantity,
        notes,
        item:depouillement_items(*)
      `)
            .single();

        if (data) {
            setSequenceItems(sequenceItems.map(si => si.id === id ? data as any : si));
        }
    };

    const createNewItem = async () => {
        if (!newItemName.trim()) return;

        const { data } = await supabase
            .from('depouillement_items')
            .insert({
                category_id: categoryId,
                name: newItemName.trim(),
                description: newItemDescription.trim() || null,
            })
            .select()
            .single();

        if (data) {
            setAllItems([...allItems, data]);
            setNewItemName('');
            setNewItemDescription('');
            setShowCreateModal(false);
        }
    };

    const deleteItem = async (itemId: string) => {
        if (!confirm('Supprimer définitivement ce membre ? Il sera retiré de toutes les séquences.')) return;

        await supabase.from('depouillement_items').delete().eq('id', itemId);
        setAllItems(allItems.filter(item => item.id !== itemId));
        setSequenceItems(sequenceItems.filter(si => si.item_id !== itemId));
    };

    // Items disponibles (pas encore dans la séquence)
    const availableItems = allItems.filter(
        item => !sequenceItems.some(si => si.item_id === item.id)
    );

    if (!sequenceId) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <p>Sélectionnez une séquence pour gérer les membres de l'équipe</p>
            </div>
        );
    }

    return (
        <div className="flex w-full h-full flex-col gap-4 overflow-hidden ">
            {/* Header avec titre de la séquence */}
            <div className="flex items-center justify-between px-2 flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-white">{categoryName}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">{sequenceName}</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Créer
                </button>
            </div>

            {/* Conteneur des 2 colonnes */}
            <div className="flex flex-1 gap-4 min-h-0">
                {/* Colonne de gauche: Tous les membres disponibles */}
                <div
                    className="w-1/2 flex flex-col bg-slate-900/30 rounded-xl border border-slate-700/50 p-4 min-h-0"
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (!draggedItem) return;

                        // Si on drag un item de la séquence vers la bibliothèque, on le retire
                        const isInSequence = sequenceItems.some(si => si.item_id === draggedItem);
                        if (isInSequence) {
                            const itemToRemove = sequenceItems.find(si => si.item_id === draggedItem);
                            if (itemToRemove) {
                                removeItemFromSequence(itemToRemove.id);
                            }
                        }
                        setDraggedItem(null);
                    }}
                >
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <span>📚</span>
                            Bibliothèque
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                        {allItems.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                <p>Aucun membre créé</p>
                                <p className="text-xs mt-1">Cliquez sur "Créer" pour commencer</p>
                            </div>
                        ) : availableItems.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                <p>Tous les membres sont dans la séquence</p>
                            </div>
                        ) : (
                            availableItems.map(item => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={() => handleDragStart(item.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`group p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-blue-500/50 cursor-grab active:cursor-grabbing transition-all ${draggedItem === item.id ? 'opacity-50 scale-95' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <GripVertical className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-medium text-white text-sm truncate">{item.name}</h4>
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/50 text-red-400 rounded transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            {item.description && (
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Colonne de droite: Membres dans la séquence */}
                <div
                    className={`w-1/2 flex flex-col bg-slate-900/50 rounded-xl border-2 border-dashed p-4 min-h-0 transition-all duration-200 ${draggedItem
                            ? 'border-blue-500/80 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                            : 'border-slate-700/50'
                        }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDropToSequence}
                >
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <span>👥</span>
                            Dans la séquence ({sequenceItems.length})
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                        {sequenceItems.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-center text-slate-500">
                                <div>
                                    <p className="text-sm">Glissez-déposez des membres ici</p>
                                    <p className="text-xs mt-1">Depuis la bibliothèque de gauche</p>
                                </div>
                            </div>
                        ) : (
                            sequenceItems.map(si => (
                                <div
                                    key={si.id}
                                    draggable
                                    onDragStart={() => handleDragStart(si.item_id)}
                                    onDragEnd={handleDragEnd}
                                    className={`p-3 bg-slate-800/70 rounded-lg border border-slate-700/70 hover:border-slate-600 transition-colors cursor-grab active:cursor-grabbing ${draggedItem === si.item_id ? 'opacity-50 scale-95' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0 ">
                                            <div className="flex items-start justify-between gap-2 ">
                                                <div className="items-center gap-2 ">
                                                    <div className="flex items-center gap-2 ">
                                                        <GripVertical className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                        <h4 className="font-semibold text-white text-sm">{si.item.name}</h4>
                                                    </div>
                                                    {si.item.description && (
                                                        <p className="text-xs text-slate-400 mt-1">{si.item.description}</p>
                                                    )}
                                                </div>

                                                {/* Quantité et notes inline */}
                                                <div className="flex gap-2 ">
                                                    <div className="flex items-center gap-1">
                                                        <label className="text-xs text-slate-500">Qté:</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={si.quantity}
                                                            onChange={e => updateQuantity(si.id, parseInt(e.target.value) || 1)}
                                                            className="w-14 px-2 py-0.5 text-xs bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={si.notes || ''}
                                                onChange={e => updateNotes(si.id, e.target.value || null)}
                                                placeholder="Notes..."
                                                className="w-full px-2 py-0.5 text-xs bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal: Créer un nouvel item */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Créer un membre - {categoryName}</h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewItemName('');
                                    setNewItemDescription('');
                                }}
                                className="p-1 hover:bg-slate-700 rounded text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nom *
                                </label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    placeholder="Ex: Jean Dupont, Marie Martin..."
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Description (optionnel)
                                </label>
                                <textarea
                                    value={newItemDescription}
                                    onChange={e => setNewItemDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Rôle, caractéristiques, informations supplémentaires..."
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewItemName('');
                                        setNewItemDescription('');
                                    }}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={createNewItem}
                                    disabled={!newItemName.trim()}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    Créer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
