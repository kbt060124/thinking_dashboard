import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { TagCloud } from "react-tagcloud";
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import HeatMap from "@uiw/react-heat-map";
import { faker } from "@faker-js/faker";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TranslateIcon from "@mui/icons-material/Translate";
import TimerIcon from "@mui/icons-material/Timer";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard(props) {
    console.log(props.heatMapData);

    const wordData = [
        { value: "JavaScript", count: 38 },
        { value: "React", count: 30 },
        { value: "Nodejs", count: 28 },
        { value: "Express.js", count: 25 },
        { value: "HTML5", count: 33 },
        { value: "MongoDB", count: 18 },
        { value: "CSS3", count: 20 },
    ];

    const pieOptions = {
        plugins: {
            //タイトル関連
            legend: {
                labels: {
                    color: "#fff",
                },
            },
        },
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    color: "#fff",
                },
            },
            title: {
                display: false,
                text: "月間推移",
            },
        },
        scales: {
            //x軸関連
            x: {
                ticks: {
                    color: "#fff", //テキストの色
                },
            },
            //y軸関連
            y: {
                ticks: {
                    color: "#fff",
                },
            },
        },
    };

    const pieData = {
        labels: props.pieDataLabels,
        datasets: [
            {
                label: "# of Scale",
                data: props.pieDataCounts,
                backgroundColor: props.alphaColors,
                borderColor: props.colors,
                borderWidth: 1,
            },
        ],
    };

    const lineData = {
        labels: props.months,
        datasets: props.lineData,
    };

    const currentDate = new Date();
    // 現在の月から6を引いて半年前の日付を計算
    const sixMonthsAgo = new Date(
        currentDate.setMonth(currentDate.getMonth() - 6)
    );

    return (
        <AuthenticatedLayout user={props.auth.user}>
            <Head title="Dashboard" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow-sm sm:rounded-lg">
                    <h2 className="pl-6 py-6 text-2xl">Summary</h2>
                    <div className="px-6 mx-3 bg-gray-800 rounded-xl">
                        <div className="py-6 flex justify-between">
                            <div className="p-3 bg-gray-900 w-5/12 rounded-xl">
                                <div className="mb-2 flex items-end">
                                    <EditNoteIcon
                                        className="text-yellow-300"
                                        fontSize="large"
                                    />
                                    <p className="ml-2 text-xl">
                                        {props.totalMemos}
                                    </p>
                                </div>
                                <p>Total Memos</p>
                            </div>
                            <div className="p-3 bg-gray-900 w-5/12 rounded-xl">
                                <div className="mb-2 flex items-end">
                                    <TranslateIcon
                                        className="text-green-300"
                                        fontSize="large"
                                    />
                                    <p className="ml-2 text-xl">
                                        {props.totalCharacters}
                                    </p>
                                </div>
                                <p className="ml-2">Total Characters</p>
                            </div>
                        </div>
                        <div className="pb-6 flex justify-between">
                            <div className="p-3 bg-gray-900 w-5/12 rounded-xl">
                                <div className="mb-2 flex items-end">
                                    <TimerIcon
                                        className="text-pink-300 text-2xl"
                                        fontSize="large"
                                    />
                                    <p className="ml-2 text-xl">
                                        {props.totalTime}
                                    </p>
                                </div>
                                <p className="ml-2">Total Writing Time</p>
                            </div>
                            <div className="p-3 bg-gray-900 w-5/12 rounded-xl">
                                <div className="mb-2 flex items-end">
                                    <RecordVoiceOverIcon
                                        className="text-blue-300 text-2xl"
                                        fontSize="large"
                                    />
                                    <p className="ml-2 text-xl">3h 46m</p>
                                </div>
                                <p>Total Dialog Time</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="pl-6 py-6 pb-3 text-2xl">Word Cloud</h2>
                    <div className="mx-6 px-6 bg-gray-800 rounded-xl">
                        <TagCloud
                            minSize={12}
                            maxSize={35}
                            tags={wordData}
                            onClick={(tag) =>
                                alert(`'${tag.value}' was selected!`)
                            }
                        />
                    </div>

                    <h2 className="pl-6 py-6 pb-3 text-2xl">Label Rate</h2>
                    <div className="mx-6 py-6 bg-gray-800 rounded-xl">
                        <Pie data={pieData} options={pieOptions} />
                    </div>

                    <h2 className="pl-6 py-6 pb-3 text-2xl">Transition</h2>
                    <div
                        className="mx-6 px-6 bg-gray-800 rounded-xl"
                        style={{ height: "400px" }}
                    >
                        {" "}
                        {/* Height adjusted for responsiveness */}
                        <Line data={lineData} options={lineOptions} />
                    </div>

                    <h2 className="pl-6 py-6 pb-3 text-2xl">Calender</h2>
                    <div className="mx-6 px-6 bg-gray-800 rounded-xl heat-map-container">
                        <HeatMap
                            value={props.heatMapData}
                            style={{ color: "white" }}
                            weekLabels={["", "Mon", "", "Wed", "", "Fri", ""]}
                            startDate={sixMonthsAgo}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
