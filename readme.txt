![image alt](https://raw.githubusercontent.com/iskanderbentaleb/e-commerce-call-center/refs/heads/main/0.png)

1) install laravel :
    composer create-project laravel/laravel example-app

2) install breeze laravel :
    - composer require laravel/breeze --dev
    - php artisan breeze:install

3) install reactjs with vite :
    - npm init vite
    - the choose best option and run project
    - cd frontend
    - npm install
    - npm run dev
    - php artisan serve --host=0.0.0.0 --port=8000 

//----- MAKE IT PUBLIC WIFI -----
1) ipconfig getifaddr en0  ||-> this is to get host ip
2) ( turn off firewall )
3) php artisan serve --host=0.0.0.0 --port=8000 
4) npm run dev -- --host
//----- MAKE IT PUBLIC WIFI -----


4) install react-router-dom :
    - npm i react-router-dom

5) setup layouts and pages in frontend

6) install ui.shadcn with vite :
    - https://ui.shadcn.com/docs/installation
   or : mantine.dev

7) add routing : 

8) the we create form of login with : react-hook-form and zod we found it in => shadcn

9) install axios :
    npm i axios

10) create api => .src/api/axios.js

11) create .env file and put backend domaine Name => une seul fois 

12) the we use axios in form login

13) this commande to know : Routes of app laravel :
    - php artisan route:list
    - the call api with axios // it comback with result

14) backend : we migrate tables of databse to ( drop db and run it again )
    - php artisan migrate:fresh --seed
    // user facories to fill users
    
15) we have probleme with csrf in forms :
    we use this path : http://localhost:8000/sanctum/csrf-cookie =>  /sanctum/csrf-cookie => in axios 
    the send request post to server // give use a cookies in browser to login 
    the code is : Login.jsx

16) we can secure routes now that can't show without login :
    - we modify in Router/index.jsx and add route => guest 

17) then we feetch student in  : StudentDashboardLayout
    // we need to use student in many componenet so we can choose between //=> redux || context api
    - in our example we used context api

18) then we change the Login page //=> to use ( context api ) for best practise 
    => we create Services/Api/Student/StudentApi.js
    => this file put inside it functions that controle apis of student 
    // becuse if we want to change one link with laravel : // in react server crached 


19) after making diagrame of db : we start to build backend with db diagrame :
    - php artisan make:model Teacher -mcr --api
    // this commande create ( Model / migraion (databse Info) / controller)
    // note : the ressource we should add it 


20) now we go to migrations and add the info that we Need for example Teacher migration
    - after add info
    - go to model and add softDeletes // because we don't delete data for authorisation of Model

21) we set all migrations // databses tables

22) if we want to change users iformations because we have already migrate users table we can run this cmd :
    - php artisan make:migration add_fields_to_users_table --table=users

23) after set migrations we run command :
    - php artisan migrate

24) note we use rolleback in migration in the migration that we create just now 
    - evité de modifé les migration
    - add new one 
    - for example we forgot : password for Teacher & Admin :
        - we add new migration
        - php artisan make:migration add_password_to_admins_table --table=admins
        - php artisan make:migration add_password_to_teachers_table --table=teachers
    - then we migrate :
        - php artisan migrate


25) when we want to remplire fake information (many) to table to test :
    - php artisan make:factory Admin
    - php artisan make:factory Teacher
    - the we run seeder for fill info :
        - php artisan migrate:fresh --seed



26)/------------------------- Multi auth laravel -------------------------------/

    * link : https://www.youtube.com/watch?v=WC_8RS0YYMg&list=PLm_sigBWSRY13JIWMkihzQq1ktg830aKm&index=12&ab_channel=JamaouiMouad

    - After setup migration of techer for example & admin & users : ( email , passsword , remerbre_token...)
    
    1) goto : config/auth.php : setup setting to accept many users auth
        - change providers , password , guards
        - don't forgot to change 'driver' => 'eloquent' in provider 
        - test if users work correct // 

    2) goto : app/Http/Requests/Auth/LoginRequest.php
        - in Auth::attempt // it work by default with web guard we want to work with : web , admins , teacher
        - we add function guard('web') // to spicify wich guard can we conncet with
            
            //===========this is my eddited code===============

                $guards = array_keys(config('auth.guards'));
                $isLogged = false ;

                foreach ($guards as $guard) {
                    if(Auth::guard($guard)->attempt($this->only('email', 'password'), $this->boolean('remember'))){
                        $isLogged = true ;
                        break;
                    }
                }

                if(!$isLogged){
                    RateLimiter::hit($this->throttleKey());
                    throw ValidationException::withMessages([
                        'email' => __('auth.failed'),
                    ]);
                }

            //===========this is my eddited code===============
        
        - then : goto model : techer for example and change hititage form
            use Illuminate\Foundation\Auth\User as Authenticatable;
            class Teacher extends Authenticatable{}
        -  now we can login but we can't decconnect for example
   
    3)  goto : routes/api.php
        - and add : middleware(['auth:sanctum,admin,teacher'])
    
    4) goto : routes/auth.php
    for logout add this :
    Route::middleware(['auth:sanctum,admin,teacher'])->group(function () {
        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth')->name('logout');
    });
    - for make all users make logout

  /------------------------- Multi auth laravel -------------------------------/







27) /------------------------ Multi layouts & sanctum ---------------------------/
    
    after step 23 , we setup every user his pages in layouts and Router
    we need to send the user After login to his layout page 
    1) goto : /app/Http/Controllers/Auth/AuthenticatedSessionController.php
        - change some code please read it from type of fucntion ... to the end 
        )))-> and don't forgot to add :  
        use  .... , HasApiTokens ,...  in models : teacher , admin , user
    2) then we goto Models User and add : 

    - every Model add his role : for example ( user : Student / teacher : teacher ... )
    //-------Code---------
    protected $appends = ['role'];
    public function getRoleAttribute(){
        return 'student';
    }
    //-------Code--------

    - this code return attribut role in :
    app/Http/Controllers/Auth/AuthenticatedSessionController.php => store function when we logged in

    3) Affter Responce we got data of user in network affter console.log(responce)
        - and we get the role that we send it in Model 
        - the role we got is what we chechked and send to layout (admin,user ...)

    4) Now the token of is engistred in db -> personal_access_tokens table
    - we need to delete it after deconnect :
        goto : app/Http/Controllers/Auth/AuthenticatedSessionController.php -> destroy function 
        - and copy the code that writed

    /------------------------ Multi layouts & sanctum ---------------------------/




28) /---------------- Create a studentParent and store it in a database ------------------/
    1) Delete all controllers that we create just keep Controller.php
    2) Run this commande :
        => php artisan make:controller StudentParentController --model=StudentParent --resource --requests --api
        . resource : is for transform your models and collections into JSON 
        . request : 
            - Determine if the user is authorized to make this request.
            - Get the validation rules that apply to the request.
        . api : crud operation in controller 
    3) goto routes :

        Route::apiResources([
            'parents' => StudentParent::class ,
        ]);

        - now when we run this commande :
            => php artisan route:list
            see all routes 
    
    4) now we goto : 
        StudentParentController and click => StoreStudentParentRequest => change authorize function and make it retuen true for testing in postman
        // dont forget to change it in production because user should be login to see this results

    5) now goto Model : StudentParent and add fillable :
        protected $fillable = ['lastname','name',....ext];
        this is for the usage in controller of data 

    6) make validation data => goto => app/Http/Requests/StoreStudentParentRequest.php 

    7) test with postman // don't forgot to add : Accept->application/json in Headers to get errors

    8) goto : StudentParentController -> store -> edit code to save dataForm

    9) now we create resource of StudentParentResource :
        - resources provide a way to transform your models and collections of models into JSON
            -> php artisan make:resource StudentParentResource 

    /---------------- Create a studentParent and store it in a database ------------------/






29) /---------------- Sanctum token abilities ------------------/
    1) goto -> routes/api.php => middleware(['auth:sanctum,admin,teacher']) -> make it like this -> middleware(['auth:sanctum'])
    2) goto -> postman -> authorazation -> bariare token -> and add token that back from users when he loggin
    3) goto -> config/sanctum.php : 
        - 'guard' => ['web'],  -> 'guard' => [],    // for verify just by token that we send to you
    4) goto bootstrap/app.php ->  $middleware->alias([]) -> add this codes :
        - 'abilities' => CheckAbilities::class,
        - 'ability' => CheckForAnyAbility::class,
    5) goto -> routes/api.php => middleware(['auth:sanctum' , 'ability:teacher']) // this route just teacher can see it  
    6) add prefix to our routes // don't forgot to change it in frontend api calls
    7) don't forgot to add in -> Frontend/src/api/axios.js :
     ----------------- code -----------------
        axiosClient.interceptors.request.use(
        (config) => {
        // Add authorization token to headers
        const token = localStorage.getItem('Token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;

        },
        (error) => {
        // Handle request error
        return Promise.reject(error);
        }
    );
    ----------------- code -----------------

    8) now it login perfectly 

    /---------------- Sanctum token abilities ------------------/


30) now we start to make crud operation of parentStudent : 
    in controllers we setup the functions 
// don't forgot to test with postman 



31) and now make the ui of website with react as well






32)------------------------  language in laravel 11 ----------------------------


        1) run this commande :
            ->  php artisan lang:publish
            // in will create folder :
            
            /lang
                /en
                    auth.php
                    messages.php
                    ....
                /fr
                    auth.php
                    messages.php
                    ...
        
        2) add middleware : 
            -> php artisan make:middleware SetLocale


        3) inside middleware add this code :
            // ---------------
            public function handle(Request $request, Closure $next): Response
            {
                // Check if the request has a locale parameter
                $locale = $request->header('X-Locale', $request->query('locale', config('app.locale')));

                // Validate the locale
                if (!in_array($locale, ['en', 'fr'])) {
                    return response()->json(['error' => 'Unsupported locale'], 400);
                }

                // Set the locale
                App::setLocale($locale);

                return $next($request);
            }
            // -----------------


        4) confgure middleware : in => bootstrap -> app.php
            $middleware->alias([
                ....
                ...
                'locale' => \App\Http\Middleware\SetLocale::class,
            ])


        5) add midlware to group of routes :

            // set laguages // put paramerter of like : /login?locale=fr
            
            Route::middleware(['locale'])->group(function () {

                Route::get('/greeting', function () {
                    return response()->json(['message' => __('messages.welcome')]);
                });

                Route::post('/login', [AuthenticatedSessionController::class, 'store'])
                    ->middleware('guest')
                    ->name('login');
            });

        // and you can add middleware in all routes of app 
32)------------------------  language in laravel 11 ----------------------------







33) ------------------ when we login multiple times he go to '/' -------------------

    // remove response '/' after login -----> remove redirection
    // backend/vendor/laravel/framework/src/Illuminate/Auth/Middleware/RedirectIfAuthenticated.php

33) ------------------ when we login multiple times he go to '/' -------------------




34) ------------------- websocket in your app -------------------

websocket is protocole to transer data : double ( ytble mn server and client client<->sever ) 

in laravel we can use many third part extention to implement ( websocket ) 
i prefer to make with myself with reveb : we go to documentation :
go to : https://github.com/iskanderbentaleb/e-commerce-call-center/tree/useWebsocketBasic to see what we should change 
in backend :
==> 1) : php artisan install:broadcasting
==> 2) : composer require laravel/reverb
==> 3) : composer require laravel/reverb
in frontend : 
==> 1) npm install --save-dev laravel-echo pusher-js 
==> 2) we go to backend it created ( ressource > js > echo.js ) copy this and copy in fronend 
and modify it ... authorazation and auth of sactume ( dont forget to filled env with what we need )
==> 3) importent : backend/bootstrap/app.php
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
    )
for test :
==> 1) php artisan serve 
==> 2) php artisan reverb:start --debug
==> 3) php artisan queue:listen (this for listen the change in backend if changed success the problem is fronend )X
==> 4) php artisan queue:work
==> 5) php artisan tinker ( for test in backend work ) :
and put this : 
//====== code ======

use App\Models\Mail;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Broadcast;
$mail = Mail::create([
    'order_id' => 247,
    'message' => 'Hello, this is a real-time message!',
    'sender_admin_id' => 2,
    'receiver_admin_id' => 2,
    'status_id' => 1,
]); Broadcast::event(new MessageSent($mail));

//====== code ======

------------------- websocket in your app -------------------












----------------- git & github -----------------------

A) ----------------- git ------------------- 

1) this commande : start tracking project 
    > git init
2) this File : ).gitignore) : is used what foleder we should not put in github public

3) this commande : save this version of code :  ) it is like ) waiting room befor offecial saved
    > git add . / git add index.html
    we (.) is all project / or we can spicify file like: index.html

4) this commande : use to save your change in git ( offecial ) 
    > git commit -m "Initial commit"
    "Initial commit" is what we change for example : ux/ux change colors // reminde you what you change
    - we used to make make this part of project is part of history 

5) this is for status of file what we changed of know
    > git status

6) to know the all the change with note like : "Initial commit" / date and author
    > git log 
    > git log --oneline

7) If you are currently on another branch and want to return to the main branch, run:
    > git checkout main

-------------- danger --------------
8) this is git give progress of your project and change it by <commit-id> of change 
    > git revert <commit-id> 
    exple run this : git log --oneline / then run this : git revert 8a0f052 / then we save what we want

9) we have also this commade to reset change and start from beging
    > git reset --hard <commit-id> 
-------------- danger --------------

10) Branchs : 
    helpful copy the original code of main and we edit it wethout toutching the main intel we validate 
    - to create new Branch :
        > git branch contact-form
    - switch to it :
        > git checkout contact-form

    - after updating brache code ( and we done update )
        - we save the : 
                > git add . 
        - and we validate :
                > git commit -m "add contact form"
    
    - we go back to the main brach (original) and merge the new branch with offecial
        > git merge contact-form
    
    after add it on the main we can delete the contact-form brach by this comande :
        > git branch -d contact-form

-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------



B) ---------------- github ----------------

1) create repesetory 

2) this commande : tell git where is your repository is located 
    > git remote add origin https://github.com/username/repo-name.git

3) this commande : rename your current branch to "main"
    > git branch -M main

4) this share the code on github :
    > git push -u origin main

B) ---------------- github ----------------
