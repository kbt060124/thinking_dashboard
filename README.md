# Webアプリケーション仕様書

## 概要
このWebアプリケーションは、ユーザーがメモを作成、管理できるプラットフォームです。ユーザーはテキストや画像をアップロードしてメモを作成し、それらをダッシュボードで確認できます。

## 主な機能

### メモの作成
- ユーザーはテキストや画像をアップロードしてメモを作成できます。
- 画像からテキストを抽出する機能があります（Google Vision APIを使用）。
- メモにはラベルを付けることができます。

### ダッシュボード
- ユーザーはダッシュボードで以下の情報を確認できます：
  - 作成したメモの総数
  - メモに含まれる文字の総数
  - メモの作成に費やした時間の総数
  - メモのラベル分布（円グラフ）
  - 月間のメモ作成推移（折れ線グラフ）
  - メモ作成のカレンダーヒートマップ
  - 頻出ワードを用いたWordCloud（作成中）

### メモの管理
- ユーザーは作成したメモを一覧で確認し、編集や削除ができます。

## 技術スタック

### フロントエンド
- React
- Tailwind CSS
- Chart.js
- React Select
- React Date Picker

### バックエンド
- Laravel
- MySQL

### その他
- Docker
- Google Vision API

## コードスニペット

### メモの作成処理

```72:84:app/Http/Controllers/MemoController.php
    public function store(Request $request)
    {
        $posts = $request->all(); // 全データを受け取る場合
        $memos = [];
        foreach ($posts as $post) {
            $memos[] = [
                "text" => $post['text'],
                "date" => date('Y-m-d', strtotime($post['date'])),
                "user_id" => auth()->id(),
                "label_id" => $post['label'],
            ];
        }
        Memo::insert($memos);
```


### ダッシュボードのデータ準備

```46:57:app/Http/Controllers/MemoController.php
        return Inertia::render('Dashboard', [
            'totalMemos' => $totalMemos,
            'totalTime' => $totalTime,
            'totalCharacters' => $totalCharacters,
            'colors' => $colors,
            'alphaColors' => $alphaColors,
            'pieData' => $pieData,
            'pieDataLabels' => $pieDataLabels,
            'pieDataCounts' => $pieDataCounts,
            'months' => $months,
            'lineData' => $lineData,
            'heatMapData' => $heatMapData
```


### メモ作成ページ

```12:316:resources/js/Pages/UpMemo.jsx
const UpMemo = (props) => {
    const labels = props.labels;
    const maxImagesUpload = 20;
    const inputId = Math.random().toString(32).substring(2);
    const key = usePage().props.API;
    const googleUrl = `https://vision.googleapis.com/v1/images:annotate?key=${key}`;
    const [images, setImages] = useState([]);
    const [texts, setTexts] = useState([]);
    // const [labels, setLabels] = useState([]);
    const [selectLabels, setSelectLabels] = useState([]);
    const [date, setDate] = useState(new Date().toISOString());

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        const postData = {};

        images.forEach((image, index) => {
            let array = {};
            array.text = texts[index];
            array.date = new Date(date).toISOString();
            array.label = selectLabels[index]
                ? selectLabels[index].value
                : "デフォルト値";
            postData[index] = array;
        });

        try {
            await axios.post(route("memos.store"), postData, {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error calling the Vision API", error);
            console.error("Response from Vision API:", error.response);
            setTexts((prevText) => [...prevText, null]);
        }

        setImages([]);
        setTexts([]);
        setSelectLabels([]);
    };
```


### ダッシュボードページ

```34:209:resources/js/Pages/Dashboard.jsx
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
```


## デプロイメント
このアプリケーションはDockerを使用してデプロイされます。`docker-compose.yml`ファイルには、アプリケーションのサービス（Laravelアプリケーション、MySQLデータベースなど）の設定が含まれています。


```1:41:docker-compose.yml
services:
#以下コードを追加
    phpmyadmin:
        image: phpmyadmin/phpmyadmin
        links:
            - mysql:mysql
        ports:
            - 8080:80
        environment:
            #PMA_USER: "${DB_USERNAME}"
            #PMA_PASSWORD: "${DB_PASSWORD}"
            PMA_HOST: mysql
        networks:
            - sail
    laravel.test:
        build:
            context: ./vendor/laravel/sail/runtimes/8.3
            dockerfile: Dockerfile
            args:
                WWWGROUP: '${WWWGROUP}'
        image: sail-8.3/app
        extra_hosts:
            - 'host.docker.internal:host-gateway'
        ports:
            - '${APP_PORT:-80}:80'
            - '${VITE_PORT:-5173}:${VITE_PORT:-5173}'
        environment:
            WWWUSER: '${WWWUSER}'
            LARAVEL_SAIL: 1
            XDEBUG_MODE: '${SAIL_XDEBUG_MODE:-off}'
            XDEBUG_CONFIG: '${SAIL_XDEBUG_CONFIG:-client_host=host.docker.internal}'
            IGNITION_LOCAL_SITES_PATH: '${PWD}'
        volumes:
            - '.:/var/www/html'
        networks:
            - sail
        depends_on:
            - mysql
            - redis
            - meilisearch
            - mailpit
```


## 注意事項
- このアプリケーションは開発中であり、仕様は変更される可能性があります。
- Google Vision APIを使用するためには、Google Cloud PlatformでAPIキーを取得し、適切に設定する必要があります。
