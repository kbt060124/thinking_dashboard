<?php

namespace App\Http\Controllers;

use App\Models\Label;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $labels = Label::all(['id', 'name'])->map(function ($label) {
            return ['value' => $label->id, 'label' => $label->name];
        });

        return Inertia::render('UpMemo', ['labels' => $labels]);
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Label $label)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Label $label)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Label $label)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Label $label)
    {
        //
    }
}
