const users = [
    { name: "Alexandra Sunnydale", phone: "2025", time: "12.12.25 - 12:34", img: "https://housingdigital.co.uk/wp-content/uploads/2021/03/MallardsSwanley006-1024x769.jpg" },
    { name: "Benjamin Greenfield", phone: "2025", time: "12.12.25 - 12:34", img: "https://housingdigital.co.uk/wp-content/uploads/2021/03/MallardsSwanley006-1024x769.jpg" },
    { name: "Charlotte Maplewood", phone: "2025", time: "12.12.25 - 12:34", img: "https://housingdigital.co.uk/wp-content/uploads/2021/03/MallardsSwanley006-1024x769.jpg" },
    { name: "Daniel Riverside", phone: "2025", time: "12.12.25 - 12:34", img: "https://housingdigital.co.uk/wp-content/uploads/2021/03/MallardsSwanley006-1024x769.jpg" },
    { name: "Emily Oakridge", phone: "2025", time: "12.12.25 - 12:34", img: "https://www.formfitout.co.uk/wp-content/uploads/Golding_Homes_office_fitout_design_Kent.jpg" },
    { name: "Frank Cedar Grove", phone: "2025", time: "12.12.25 - 12:34", img: "https://www.formfitout.co.uk/wp-content/uploads/Golding_Homes_office_fitout_design_Kent.jpg" },
    { name: "Grace Pine Hill", phone: "2025", time: "12.12.25 - 12:34", img: "https://www.formfitout.co.uk/wp-content/uploads/Golding_Homes_office_fitout_design_Kent.jpg" },
    { name: "Henry Willow Creek", phone: "2025", time: "12.12.25 - 12:34", img: "https://www.formfitout.co.uk/wp-content/uploads/Golding_Homes_office_fitout_design_Kent.jpg" },
    { name: "Isabella Birchwood", phone: "2025", time: "12.12.25 - 12:34", img: "https://goldingplaces.co.uk/app/uploads/2023/08/The-Burrows-Plots-112-113-992x661.jpg" },
    { name: "Jack Elm Street", phone: "2025", time: "12.12.25 - 12:34", img: "https://goldingplaces.co.uk/app/uploads/2023/08/The-Burrows-Plots-112-113-992x661.jpg" },
    { name: "Liam Hawthorne", phone: "2025", time: "12.12.25 - 12:34", img: "https://goldingplaces.co.uk/app/uploads/2023/08/The-Burrows-Plots-112-113-992x661.jpg" }
];

const Foydalanuvchilar = () => {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="font-Inter mb-4 text-3xl">Foydalanuvchilar</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray text-gray-600 border-b border-gray-300">
                            <th className="p-4 w-[30px] font-Inter">Nomi</th>
                            <th className="p-4 w-[100px] font-Inter">Telefon</th>
                            <th className="p-4 w-[30px] font-Inter">Ro'yxatdan o'tgan vaqti</th>
                            <th className="p-4 w-[30px] "></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index} className=" hover:bg-gray-50">
                                <td className="p-4 flex items-center gap-3">
                                    <img src={user.img} alt={user.name} className="w-10 h-10 rounded-full" />
                                    <span>{user.name}</span>
                                </td>
                                <th className="p-4 font-light font-Inter">{user.phone}</th>
                                <th className="p-4 font-light font-Inter">{user.time}</th>
                                <th className="p-4 text-center">...</th>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Foydalanuvchilar;
