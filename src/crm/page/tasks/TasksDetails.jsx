import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Flag, DollarSign, Info, BarChart2, Edit, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";

// Mock data (same as ProjectPage)
const projectsData = [
  {
    "id": 1,
    "text": "Loyiha uchun mobil dizayn kerak",
    "created_at": "2025-04-15T12:34:56Z",
    "updated_at": "2025-04-15T13:00:00Z",
    "status_choice": "new",
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

// StatusBadge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    new: { bg: "bg-blue-100", text: "text-blue-800", label: "Yangi" },
    in_progress: { bg: "bg-green-100", text: "text-green-800", label: "Jarayonda" },
    completed: { bg: "bg-purple-100", text: "text-purple-800", label: "Tugallangan" },
    on_hold: { bg: "bg-yellow-100", text: "text-yellow-800", label: "To'xtatilgan" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Bekor qilingan" }
  };

  const style = statusStyles[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

// CategoryBadge component
const CategoryBadge = ({ category }) => {
  const categoryStyles = {
    design: { bg: "bg-purple-100", text: "text-purple-800", label: "Dizayn" },
    development: { bg: "bg-blue-100", text: "text-blue-800", label: "Dasturlash" },
    marketing: { bg: "bg-green-100", text: "text-green-800", label: "Marketing" }
  };

  const style = categoryStyles[category] || { bg: "bg-gray-100", text: "text-gray-800", label: category };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

// UserAvatar component
const UserAvatar = ({ user }) => {
  return (
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <User size={16} className="text-gray-600" />
      </div>
      <div className="ml-2">
        <p className="text-sm font-medium text-gray-800">{user.email.split('@')[0]}</p>
        <p className="text-xs text-gray-500">
          {user.is_admin ? "Admin" : user.is_developer ? "Developer" : "User"}
        </p>
      </div>
    </div>
  );
};

// Format date for display
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// ProjectDetailsPage component
export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projectsData.find((p) => p.id === parseInt(id));

  if (!project) {
    return <div className="p-4 text-center text-gray-500">Loyiha topilmadi</div>;
  }

  // Mock data for charts since it's not in the original JSON
  const progressData = [
    { name: "Completed", value: 35 },
    { name: "Remaining", value: 65 },
  ];

  const budgetData = {
    used: 1500,
    total: 5000
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{project.text}</h2>
          </div>
          <div className="flex space-x-2">
            <StatusBadge status={project.status_choice} />
            <CategoryBadge category={project.category_choice} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Project Info Card */}
          <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
            <h3 className="font-medium text-lg mb-4 flex items-center text-gray-800">
              <Info size={18} className="mr-2 text-blue-600" /> Loyiha ma'lumotlari
            </h3>
            <div className="space-y-3">
              <p className="flex items-center text-sm">
                <Calendar size={16} className="mr-2 text-gray-500" />
                <span className="font-medium mr-2">Yaratilgan:</span>
                {formatDate(project.created_at)}
              </p>
              <p className="flex items-center text-sm">
                <Calendar size={16} className="mr-2 text-gray-500" />
                <span className="font-medium mr-2">Yangilangan:</span>
                {formatDate(project.updated_at)}
              </p>
              <p className="flex items-center text-sm">
                <User size={16} className="mr-2 text-gray-500" />
                <span className="font-medium mr-2">Foydalanuvchilar:</span>
                {project.user.length}
              </p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
            <h3 className="font-medium text-lg mb-4 flex items-center text-gray-800">
              <BarChart2 size={18} className="mr-2 text-blue-600" /> Jarayon
            </h3>
            <div className="flex items-center justify-center h-32">
              <PieChart width={120} height={120}>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#E5E7EB" />
                </Pie>
              </PieChart>
              <div className="text-center ml-2">
                <div className="text-2xl font-bold text-blue-600">{progressData[0].value}%</div>
                <p className="text-sm text-gray-500">Bajarildi</p>
              </div>
            </div>
          </div>

          {/* Budget Card */}
          <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
            <h3 className="font-medium text-lg mb-4 flex items-center text-gray-800">
              <DollarSign size={18} className="mr-2 text-blue-600" /> Byudjet
            </h3>
            <div className="flex flex-col items-center justify-center h-32">
              <div className="relative pt-1 w-full mb-4">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      Byudjet
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {Math.round((budgetData.used / budgetData.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${(budgetData.used / budgetData.total) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                  ></div>
                </div>
              </div>
              <p className="text-center text-sm font-medium text-gray-700">
                ${budgetData.used.toLocaleString()} of ${budgetData.total.toLocaleString()} used
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 bg-gray-50 p-5 rounded-xl shadow-sm">
          <h3 className="font-medium text-lg mb-3 text-gray-800">Tavsif</h3>
          <p className="text-gray-700">{project.text}</p>
        </div>

        {/* Team Members */}
        <div className="mb-8">
          <h3 className="font-medium text-lg mb-4 text-gray-800">Foydalanuvchilar</h3>
          {project.user && project.user.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.user.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <UserAvatar user={user} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 bg-gray-50 p-4 rounded-xl">Foydalanuvchilar mavjud emas</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
            <Edit size={16} className="mr-2" /> Tahrirlash
          </button>
          <button className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center transition-colors">
            <Trash2 size={16} className="mr-2" /> O'chirish
          </button>
        </div>
      </div>
    </div>
  );
}