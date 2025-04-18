import { useState } from 'react';
import { X } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        text: '',
        status_choice: 'new',
        category_choice: 'design',
        user: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newProject = {
            ...formData,
            id: projectsData.length + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: [] // You'll need to implement user selection
        };
        onCreate(newProject);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Yangi Loyiha Yaratish</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loyiha matni</label>
                            <textarea
                                name="text"
                                value={formData.text}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Holati</label>
                            <select
                                name="status_choice"
                                value={formData.status_choice}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="new">Yangi</option>
                                <option value="in_progress">Jarayonda</option>
                                <option value="on_hold">To'xtatilgan</option>
                                <option value="completed">Tugallangan</option>
                                <option value="cancelled">Bekor qilingan</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
                            <select
                                name="category_choice"
                                value={formData.category_choice}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="design">Dizayn</option>
                                <option value="development">Dasturlash</option>
                                <option value="marketing">Marketing</option>
                            </select>
                        </div>

                        {/* User selection would go here */}
                        {/* You'll need to implement a proper user selection component */}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-green-400 text-white rounded-md hover:from-teal-600 hover:to-green-500"
                        >
                            Loyiha Yaratish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;