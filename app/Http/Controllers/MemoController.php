<?php

namespace App\Http\Controllers;

use App\Models\Label;
use App\Models\Memo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB; // Added to use DB::raw

class MemoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $colors = [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(211, 211, 211, 1)",
        ];

        $alphaColors = [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(211, 211, 211, 0.2)",
        ];
        $totalMemos = $this->getTotalMemos();
        $totalTime = $this->calculateTotalTime($totalMemos);
        $totalCharacters = $this->getTotalCharacters();
        $pieData = $this->getPieData();
        list($pieDataLabels, $pieDataCounts) = $this->extractPieDataLabelsAndCounts($pieData);
        $months = $this->getLastSixMonths();
        $lineData = $this->getLineData($months, $colors, $alphaColors);
        $heatMapData = $this->getHeatMapData();

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
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
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
    }

    /**
     * Display the specified resource.
     */
    public function show(Memo $memo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Memo $memo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Memo $memo)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Memo $memo)
    {
        //
    }

    private function getTotalMemos()
    {
        return Memo::count();
    }

    private function calculateTotalTime($totalMemos)
    {
        $totalMinutes = $totalMemos * 5; // Assuming 5 minutes per memo
        $hours = floor($totalMinutes / 60);
        $minutes = $totalMinutes % 60;
        return "{$hours}h {$minutes}m";
    }

    private function getTotalCharacters()
    {
        return Memo::sum(DB::raw('LENGTH(text)'));
    }

    private function getPieData()
    {
        return Memo::select('label_id', DB::raw('count(*) as count'))
            ->groupBy('label_id')
            ->get()
            ->map(function ($memo) {
                return [
                    "label_id" => $memo->label_id,
                    "name" => Label::find($memo->label_id)->name,
                    "count" => $memo->count,
                ];
            })->toArray();
    }

    private function extractPieDataLabelsAndCounts($pieData)
    {
        $labels = array_column($pieData, 'name');
        $counts = array_column($pieData, 'count');
        return [$labels, $counts];
    }

    private function getLastSixMonths()
    {
        return collect(range(0, 5))->map(function ($month) {
            return now()->subMonths($month)->format("Y-m");
        })->reverse()->values()->all();
    }

    private function getLineData($months, $colors, $alphaColors)
    {
        $sixMonthsAgo = now()->subMonths(5)->startOfMonth()->toDateString();
        $currentMonth = now()->startOfMonth()->toDateString();

        $lineDataQuery = Memo::select(
            DB::raw('DATE_FORMAT(date, "%Y-%m") as month'),
            'label_id',
            DB::raw('count(*) as count')
        )
            ->whereBetween('date', [$sixMonthsAgo, $currentMonth])
            ->groupBy('month', 'label_id')
            ->orderBy('label_id', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        $lineData = $lineDataQuery->map(function ($item) {
            $labelName = Label::where('id', $item->label_id)->first()->name ?? 'Unknown';
            return [
                'month' => $item->month,
                'label_id' => $item->label_id,
                'label_name' => $labelName,
                'count' => $item->count,
            ];
        })->groupBy('label_name')->map(function ($items, $labelName) use ($months) {
            $countsByMonth = $items->mapWithKeys(function ($item) {
                return [$item['month'] => $item['count']];
            });
            $dates = collect($months)->map(function ($month) use ($countsByMonth) {
                return $countsByMonth->get($month, 0);
            })->toArray();

            return [
                'label' => $labelName,
                'data' => $dates,
            ];
        })->values()->map(function ($item, $index) use ($colors, $alphaColors) {
            // borderColorとbackgroundColorを追加
            $item['borderColor'] = $colors[$index % count($colors)];
            $item['backgroundColor'] = $alphaColors[$index % count($alphaColors)];
            return $item;
        })->all();

        return $lineData;
    }

    private function getHeatMapData()
    {
        return Memo::select(
            DB::raw('DATE_FORMAT(date, "%Y/%m/%d") as date'),
            DB::raw('count(*) as count')
        )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();
    }
}
