import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MoreHorizontal,
    ChevronRight,
    ChevronLeft,
    Plus,
    Search,
    Filter,
    User
} from 'lucide-react';
import CreateTaskModal from '../../features/Task/CreateTaskModal';

// Sample data with Uzbek status descriptions - unchanged as requested
const projectsData = [
    {
        "id": 1,
        "text": "Loyiha uchun mobil dizayn kerak",
        "created_at": "2025-04-15T12:34:56Z",
        "updated_at": "2025-04-15T13:00:00Z",
        "status_choice": "in_progress",
        "category_choice": "design",
        "user": [
            {
                "id": 1,
                "phone": "+998901234567",
                "email": "user1@example.com",
                "is_admin": false,
                "is_developer": false
            },
            {
                "id": 2,
                "phone": "+998998765432",
                "email": "user2@example.com",
                "is_admin": true,
                "is_developer": true
            }
        ]
    }
];

// Enhanced Status Badge Component
const StatusBadge = ({ status }) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    let displayText = status;
    let borderColor = "border-gray-200";

    switch (status) {
        case "Yangi":
        case "new":
            bgColor = "bg-blue-50";
            textColor = "text-blue-700";
            borderColor = "border-blue-200";
            displayText = "Yangi";
            break;
        case "in_progress":
            bgColor = "bg-emerald-50";
            textColor = "text-emerald-700";
            borderColor = "border-emerald-200";
            displayText = "Jarayonda";
            break;
        case "on_hold":
            bgColor = "bg-amber-50";
            textColor = "text-amber-700";
            borderColor = "border-amber-200";
            displayText = "To'xtatilgan";
            break;
        case "completed":
            bgColor = "bg-indigo-50";
            textColor = "text-indigo-700";
            borderColor = "border-indigo-200";
            displayText = "Tugallangan";
            break;
        case "cancelled":
            bgColor = "bg-rose-50";
            textColor = "text-rose-700";
            borderColor = "border-rose-200";
            displayText = "Bekor qilingan";
            break;
        default:
            break;
    }

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${borderColor} ${bgColor} ${textColor} inline-flex items-center`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${textColor.replace('text', 'bg')}`}></span>
            {displayText}
        </span>
    );
};

// Enhanced Category Badge Component
const CategoryBadge = ({ category }) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    let displayText = category;
    let borderColor = "border-gray-200";

    switch (category) {
        case "design":
            bgColor = "bg-purple-50";
            textColor = "text-purple-700";
            borderColor = "border-purple-200";
            displayText = "Dizayn";
            break;
        case "development":
            bgColor = "bg-blue-50";
            textColor = "text-blue-700";
            borderColor = "border-blue-200";
            displayText = "Dasturlash";
            break;
        case "marketing":
            bgColor = "bg-green-50";
            textColor = "text-green-700";
            borderColor = "border-green-200";
            displayText = "Marketing";
            break;
        default:
            displayText = category;
            break;
    }

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${borderColor} ${bgColor} ${textColor}`}>
            {displayText}
        </span>
    );
};

// Improved User Avatar component with stacking
const UserAvatar = ({ user, index }) => {
    return (
        <div
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-500 text-white"
            style={{ marginLeft: index > 0 ? '-0.5rem' : '0' }}
        >
            <span className="text-xs font-medium">{user.email.charAt(0).toUpperCase()}</span>
        </div>
    );
};

// Main component
export default function TaskPage() {
    const [projects, setProjects] = useState(projectsData);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const navigate = useNavigate();

    // Filter projects based on search term and status filter
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.text.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || project.status_choice === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination calculation
    const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentProjects = filteredProjects.slice(startIndex, endIndex);

    const handleCreateProject = (newProject) => {
        setProjects([...projects, { ...newProject, id: projects.length + 1 }]);
    };

    const statusOptions = ['All', 'new', 'in_progress', 'on_hold', 'completed', 'cancelled'];

    // Function to handle project row click - navigate to details page
    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="p-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Enhanced Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold text-gray-800">Loyihalar</h1>
                                <span className="ml-3 bg-teal-50 text-teal-700 font-medium rounded-full px-3 py-1 text-sm">
                                    {filteredProjects.length}
                                </span>
                            </div>
                            <button
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center shadow-sm transition-all duration-200 transform hover:scale-[1.02]"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <Plus size={18} className="mr-2" />
                                Yangi loyiha
                            </button>
                        </div>
                    </div>

                    {/* Improved Filters */}
                    <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-4 bg-white">
                        <div className="flex items-center space-x-3 flex-grow">
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none border border-gray-200 rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option} value={option}>
                                            {option === 'All' ? 'Barchasi' :
                                                option === 'new' ? 'Yangi' :
                                                    option === 'in_progress' ? 'Jarayonda' :
                                                        option === 'on_hold' ? "To'xtatilgan" :
                                                            option === 'completed' ? 'Tugallangan' :
                                                                'Bekor qilingan'}
                                        </option>
                                    ))}
                                </select>
                                <Filter size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                            </div>
                            <div className="relative flex-grow max-w-md">
                                <input
                                    type="text"
                                    placeholder="Loyihalarni qidirish..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                />
                                <Search size={16} className="absolute left-3 top-3 text-gray-500" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Sahifadagi qatorlar:</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                                {[5, 10, 20, 50].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Improved Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50 border-y border-gray-200">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyiha matni</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foydalanuvchilar</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategoriya</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yaratilgan sana</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yangilangan sana</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Harakatlar</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {currentProjects.length > 0 ? (
                                    currentProjects.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                            onClick={() => handleProjectClick(project.id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                                {project.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {project.text}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {project.user.slice(0, 3).map((user, index) => (
                                                        <UserAvatar key={user.id} user={user} index={index} />
                                                    ))}
                                                    {project.user.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 ml-[-0.5rem]">
                                                            +{project.user.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={project.status_choice} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <CategoryBadge category={project.category_choice} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(project.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(project.updated_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Handle actions
                                                    }}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Search size={24} className="text-gray-400 mb-2" />
                                                <p>Loyihalar topilmadi</p>
                                                <p className="text-xs text-gray-400 mt-1">Yangi loyiha yaratish uchun "Yangi loyiha" tugmasini bosing</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Enhanced Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                        <div className="text-sm text-gray-600">
                            {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} soni {filteredProjects.length} loyihadan
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} className="text-gray-600" />
                            </button>
                            <div className="flex space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ChevronRight size={16} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </div>
    );
}