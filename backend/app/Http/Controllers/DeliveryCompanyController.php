<?php

namespace App\Http\Controllers;

use App\Models\DeliveryCompany;
use Illuminate\Http\Request;

class DeliveryCompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $deliveryCompanies = DeliveryCompany::orderBy('id')->get();
        return response()->json($deliveryCompanies);
    }


}
