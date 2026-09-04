// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Pavitra Seva';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageTelugu => 'తెలుగు';

  @override
  String get cart => 'Cart';

  @override
  String get adminOps => 'Admin ops';

  @override
  String get logout => 'Logout';

  @override
  String get namaste => 'Namaste';

  @override
  String namasteName(String name) {
    return 'Namaste, $name';
  }

  @override
  String get homePanchangTitle => 'Panchang & Zodiac';

  @override
  String get homePanchangSubtitle =>
      'Today’s tithi, muhurats, and rasi guidance';

  @override
  String get homeVidhiTitle => 'Puja Vidhi';

  @override
  String get homeVidhiSubtitle => 'Step-by-step procedures, mantras, and katha';

  @override
  String get homeKidsTitle => 'Kids Corner';

  @override
  String get homeKidsSubtitle =>
      'Festival stories and fun quizzes for all ages';

  @override
  String get homePriestsTitle => 'Book a Priest';

  @override
  String get homePriestsSubtitle => 'Find pandits, pick a slot, pay in-app';

  @override
  String get homeGuidesTitle => 'Prasad & Vrat';

  @override
  String get homeGuidesSubtitle =>
      'Fasting rules, recipes, and orderable prasad';

  @override
  String get homePackagesTitle => 'Puja Packages';

  @override
  String get homePackagesSubtitle =>
      'Kit + priest + prasad + add-ons, one payment';

  @override
  String get homeKitsTitle => 'Puja Kits';

  @override
  String get homeKitsSubtitle =>
      'Buy festival & occasion kits with in-app payment';

  @override
  String get homeSamagriTitle => 'Pooja Samagri';

  @override
  String get homeSamagriSubtitle =>
      'Festival & daily pooja essentials under one catalogue.';

  @override
  String get homeOrdersTitle => 'My Orders';

  @override
  String get homeOrdersSubtitle => 'Track paid kits and bookings';

  @override
  String get homeComingNext =>
      'Coming next: full vendor marketplace onboarding.';

  @override
  String get loginSubtitle => 'Sign in with your email and password';

  @override
  String get loginOtpSubtitle => 'Enter the OTP sent to your phone';

  @override
  String get country => 'Country';

  @override
  String get countryIndia => 'India (+91)';

  @override
  String get countryUsCa => 'USA / Canada (+1)';

  @override
  String get mobileNumber => 'Mobile number';

  @override
  String get fullNameOptional => 'Full name (optional)';

  @override
  String get sendOtp => 'Send OTP';

  @override
  String get otp => 'OTP';

  @override
  String devOtp(String code) {
    return 'Dev OTP: $code';
  }

  @override
  String get verifyContinue => 'Verify & Continue';

  @override
  String get changeNumber => 'Change number';

  @override
  String get kitsTitle => 'Puja Kits';

  @override
  String get samagriTitle => 'Pooja Samagri';

  @override
  String get samagriKitsSection => 'Complete kits';

  @override
  String get samagriItemsSection => 'Individual items';

  @override
  String get samagriDetails => 'Samagri details';

  @override
  String get packDetails => 'Pack details';

  @override
  String get optionalItem => 'Optional';

  @override
  String get noSamagri => 'No samagri listed yet';

  @override
  String get kitDetails => 'Kit details';

  @override
  String get includedItems => 'Included items';

  @override
  String qty(int count) {
    return 'Qty: $count';
  }

  @override
  String get addToCart => 'Add to cart';

  @override
  String get addedToCart => 'Added to cart';

  @override
  String get emptyCart => 'Your cart is empty';

  @override
  String get browseKits => 'Browse kits';

  @override
  String get proceedToCheckout => 'Proceed to checkout';

  @override
  String get checkout => 'Checkout';

  @override
  String get selectAddress => 'Select a delivery address';

  @override
  String get payNow => 'Pay now';

  @override
  String get processing => 'Processing…';

  @override
  String get paymentSuccessMock => 'Payment successful (mock)';

  @override
  String get paymentRedirect =>
      'Complete payment in the gateway, then return here. Webhooks confirm the order.';

  @override
  String get myOrders => 'My Orders';

  @override
  String get noOrdersYet => 'No orders yet';

  @override
  String get vidhiTitle => 'Puja Vidhi';

  @override
  String get categoryAll => 'All';

  @override
  String get categoryOccasion => 'Occasion';

  @override
  String get categoryFestival => 'Festival';

  @override
  String get categoryDaily => 'Daily';

  @override
  String get categoryVrat => 'Vrat';

  @override
  String get noVidhis => 'No vidhis published yet';

  @override
  String vidhiMeta(int minutes, String difficulty, int steps) {
    return '$minutes min · $difficulty · $steps steps';
  }

  @override
  String get katha => 'Katha';

  @override
  String get getRelatedKit => 'Get related puja kit';

  @override
  String startSteps(int count) {
    return 'Start $count steps';
  }

  @override
  String get noSteps => 'No steps available';

  @override
  String get transliteration => 'Transliteration';

  @override
  String get meaning => 'Meaning';

  @override
  String get previous => 'Previous';

  @override
  String get next => 'Next';

  @override
  String get done => 'Done';

  @override
  String get bestTime => 'Best time';

  @override
  String get duration => 'Duration';

  @override
  String get difficulty => 'Difficulty';

  @override
  String get kidsTitle => 'Kids Corner';

  @override
  String get myProgress => 'My progress';

  @override
  String get noStories => 'No stories yet';

  @override
  String get kidsProgressTitle => 'Kids progress';

  @override
  String get kidsProgressEmpty =>
      'Complete a story or quiz to see progress here.';

  @override
  String get storyCompleted => 'Story completed — great job!';

  @override
  String get back => 'Back';

  @override
  String get takeQuiz => 'Take quiz';

  @override
  String get markComplete => 'Mark story complete';

  @override
  String get whyCelebrated => 'Why we celebrate';

  @override
  String get importance => 'Why it matters';

  @override
  String get answerEveryQuestion => 'Please answer every question';

  @override
  String get quizResult => 'Quiz result';

  @override
  String get quizWellDone => 'Well done!';

  @override
  String get quizRetry => 'Good try — read again and retry';

  @override
  String quizScore(int score, int total, int passScore) {
    return 'Score: $score / $total (pass $passScore)';
  }

  @override
  String get backToKids => 'Back to Kids Corner';

  @override
  String get checking => 'Checking…';

  @override
  String get submitAnswers => 'Submit answers';

  @override
  String get ageLittle => 'Little';

  @override
  String get ageJunior => 'Junior';

  @override
  String get ageTeen => 'Teen';

  @override
  String get bookPriest => 'Book a Priest';

  @override
  String get myBookings => 'My bookings';

  @override
  String yearsExp(int years) {
    return '$years yrs';
  }

  @override
  String languagesLabel(String list) {
    return 'Languages: $list';
  }

  @override
  String get noOpenSlots => 'No open slots right now';

  @override
  String get booking => 'Booking…';

  @override
  String get bookAndPay => 'Book & pay';

  @override
  String get cancelBookingTitle => 'Cancel booking?';

  @override
  String get cancelBookingBody =>
      'This slot will be released. Paid bookings may need an admin refund.';

  @override
  String get keep => 'Keep';

  @override
  String get cancelBooking => 'Cancel booking';

  @override
  String get bookingCancelled => 'Booking cancelled';

  @override
  String get myPriestBookings => 'My priest bookings';

  @override
  String get noBookingsYet => 'No bookings yet';

  @override
  String get cancel => 'Cancel';

  @override
  String get save => 'Save';

  @override
  String get guidesTitle => 'Prasad & Vrat';

  @override
  String get tabVrat => 'Vrat';

  @override
  String get tabPrasad => 'Prasad';

  @override
  String get upcoming => 'Upcoming';

  @override
  String get noUpcoming => 'No upcoming dates seeded yet';

  @override
  String get allVrats => 'All vrats';

  @override
  String get orderable => 'orderable';

  @override
  String minServings(int minutes, int servings) {
    return '$minutes min · $servings servings';
  }

  @override
  String get packagesTitle => 'Puja Packages';

  @override
  String get packageBooked => 'Package booked successfully';

  @override
  String get pujaKit => 'Puja kit';

  @override
  String get priestVisit => 'Priest visit';

  @override
  String get addOns => 'Add-ons';

  @override
  String get bookPackagePay => 'Book package & pay';

  @override
  String get myPackageBookings => 'My package bookings';

  @override
  String get noPackageBookings => 'No package bookings yet';

  @override
  String get cancelPackageTitle => 'Cancel package?';

  @override
  String get cancelPackageBody =>
      'Linked priest slots will be released. Refunds are handled by admin if already paid.';

  @override
  String get cancelPackage => 'Cancel package';

  @override
  String get packageCancelled => 'Package booking cancelled';

  @override
  String get panchangTitle => 'Panchang & Zodiac';

  @override
  String get birthProfile => 'Birth profile';

  @override
  String get tabToday => 'Today';

  @override
  String get tabGuidance => 'Guidance';

  @override
  String get tabCalendar => 'Calendar';

  @override
  String get festivals => 'Festivals';

  @override
  String get setBirthProfile => 'Set birth profile';

  @override
  String get birthProfileSaved => 'Birth profile saved';

  @override
  String get saving => 'Saving…';

  @override
  String get saveProfile => 'Save profile';

  @override
  String get adminUsers => 'Users';

  @override
  String get adminUsersSubtitle => 'Suspend / activate accounts';

  @override
  String get adminOrders => 'Orders';

  @override
  String get adminOrdersSubtitle => 'Browse recent commerce orders';

  @override
  String get adminBookings => 'Priest bookings';

  @override
  String get adminBookingsSubtitle => 'Ops list of pandit bookings';

  @override
  String get adminOrdersTitle => 'Admin orders';

  @override
  String get adminBookingsTitle => 'Admin priest bookings';

  @override
  String get refresh => 'Refresh';

  @override
  String get signIn => 'Sign in';

  @override
  String get guest => 'Guest';

  @override
  String get homeTodayPanchang => 'Today\'s Panchang';

  @override
  String get homeUpcomingFestivals => 'Upcoming Festivals';

  @override
  String get homeFestivalsSubtitle =>
      'Complete Pooja Samagri kits for each festival — ready to book.';

  @override
  String get bookSamagriKit => 'Book samagri kit';

  @override
  String get viewAll => 'View all';

  @override
  String get homeMoreServices => 'More Services';

  @override
  String get comingSoonBadge => 'SOON';

  @override
  String get panchangShortTitle => 'Panchang';

  @override
  String panchangSunriseRahuKalam(String sunrise, String rahu) {
    return 'Sunrise $sunrise · Rahu Kalam $rahu';
  }

  @override
  String get navHome => 'Home';

  @override
  String get navSamagri => 'Samagri';

  @override
  String get navPoojaris => 'Poojaris';

  @override
  String get navAccount => 'Account';

  @override
  String get profileGuestTitle => 'Explore freely';

  @override
  String get profileGuestSubtitle =>
      'Browse festivals and Pooja Samagri without signing in. Sign in when you are ready to checkout.';

  @override
  String get signInRegister => 'Sign in / Register';

  @override
  String get browseSamagri => 'Browse Pooja Samagri';

  @override
  String get devotee => 'Devotee';

  @override
  String get profileTitle => 'Profile';

  @override
  String get edit => 'Edit';

  @override
  String get personalDetails => 'Personal Details';

  @override
  String get savedAddresses => 'Saved Addresses';

  @override
  String get familyMembers => 'Family Members';

  @override
  String get orderHistory => 'Order History';

  @override
  String get pujariDesk => 'Pujari Desk';

  @override
  String get joinAsPujari => 'Join as a pujari';

  @override
  String get admin => 'Admin';

  @override
  String get priestBookingHistory => 'Priest Booking History';

  @override
  String get notifications => 'Notifications';

  @override
  String get wishlist => 'Wishlist';

  @override
  String get support => 'Support';

  @override
  String get language => 'Language';

  @override
  String get darkMode => 'Dark Mode';

  @override
  String get logOut => 'Log Out';

  @override
  String get emptyCartBrowseSamagri => 'Browse Pooja Samagri to get started.';

  @override
  String cartQtyLine(int qty, String price) {
    return 'Qty $qty · $price';
  }

  @override
  String get remove => 'Remove';

  @override
  String get itemsSubtotal => 'Items subtotal';

  @override
  String get deliveryCharge => 'Delivery charge';

  @override
  String get total => 'Total';

  @override
  String get about => 'About';

  @override
  String get speciality => 'Speciality';

  @override
  String get howToDoPooja => 'How to do the Pooja';

  @override
  String get poojaGuidesTitle => 'Pooja samagri by pooja';

  @override
  String get poojaGuidesSubtitle =>
      'Start with the basic kit used in every home pooja. Add a deity or festival kit only for the extras that pooja needs.';

  @override
  String get commonSamagriTitle => 'Common items';

  @override
  String get deityPoojaTitle => 'Deity';

  @override
  String get festivalPoojaTitle => 'Festivals';

  @override
  String get vrathamPoojaTitle => 'Vratams';

  @override
  String get specialForThisPooja => 'Special items for this pooja';

  @override
  String get pairWithBasicKit => 'Buy basic pooja kit';

  @override
  String get pairWithBasicHint =>
      'These extras go with the common samagri — turmeric, kumkum, flowers, camphor, and the rest of the basic kit.';

  @override
  String get deitySpecificKit => 'Deity extras kit';

  @override
  String get festivalVrathamKit => 'Festival / vratam kit';

  @override
  String get commonItemsAlsoNeeded =>
      'Also keep the everyday pooja items (listed under Common).';

  @override
  String get viewCommonSamagri => 'View common samagri';

  @override
  String get poojaGuideDisclaimer =>
      'Items can vary by region, family custom, and your pujari’s vidhi.';

  @override
  String get browsePoojaGuides => 'Browse by pooja';

  @override
  String get requiredItems => 'Required Items';

  @override
  String get chooseOptionalItems => 'Choose optional items';

  @override
  String get optionalItemsHint =>
      'These are not packed unless you select them.';

  @override
  String get ganeshPoojaItemsTab => 'Home Puja';

  @override
  String get ganeshHomamTab => 'Homam';

  @override
  String get ganeshPoojaListTitle => 'Ganesh Chaturthi Home Puja';

  @override
  String get ganeshHomamListTitle => 'Ganesh Homam Samagri';

  @override
  String get completePoojaKit => 'Complete Pooja Kit';

  @override
  String get bookPoojari => 'Book Poojari';

  @override
  String get signInToAddCart => 'Sign in to add samagri to your cart';

  @override
  String get selectAtLeastOneItem => 'Select at least one pooja item.';

  @override
  String get kitNotFound => 'Kit not found';

  @override
  String get selectPoojaItems => 'Select pooja items';

  @override
  String addItemsToCart(int count) {
    return 'Add $count items to cart';
  }

  @override
  String get completeFestivalSamagri => 'Complete festival samagri';

  @override
  String itemsIncluded(int count) {
    return '$count items included';
  }

  @override
  String get loginHeaderSubtitle =>
      'Devotees and pujaris sign in with email, Google, or Apple';

  @override
  String get welcome => 'Welcome';

  @override
  String get loginWelcomeSubtitle => 'Sign in to continue your seva';

  @override
  String get emailLabel => 'EMAIL';

  @override
  String get emailHint => 'you@example.com';

  @override
  String get passwordLabel => 'PASSWORD';

  @override
  String get passwordHint => 'At least 8 characters';

  @override
  String get signInButton => 'Sign in';

  @override
  String get signInValidation =>
      'Enter a valid email and a password of at least 8 characters.';

  @override
  String get noAccountSignUp => 'New here? Create an account';

  @override
  String get createAccountTitle => 'Create account';

  @override
  String get createAccountSubtitle => 'Email, password, and mobile number';

  @override
  String get createAccountButton => 'Create account';

  @override
  String get signUpValidation =>
      'Enter email, a password of at least 8 characters, and your mobile number.';

  @override
  String get haveAccountSignIn => 'Already have an account? Sign in';

  @override
  String get mobileNumberLabel => 'MOBILE NUMBER';

  @override
  String get phoneHint => '98765 43210';

  @override
  String get orContinueWith => 'or continue with';

  @override
  String get continueWithGoogle => 'Continue with Google';

  @override
  String get continueWithApple => 'Continue with Apple';

  @override
  String get pujariApplyPrompt => 'Are you a pujari? Apply to join';

  @override
  String get termsPrivacyAgreement =>
      'By continuing you agree to our Terms of Service and Privacy Policy';

  @override
  String get verifyOtp => 'Verify OTP';

  @override
  String otpSentTo(String phone) {
    return 'Sent to +91 $phone ·';
  }

  @override
  String get otpDidntReceive => 'Didn\'t receive the code?';

  @override
  String otpResendIn(String seconds) {
    return 'Resend in $seconds';
  }

  @override
  String get otpResend => 'Resend';

  @override
  String get onboardingSlide1Title => 'Complete Pooja Kits';

  @override
  String get onboardingSlide1Desc =>
      'Order curated kits for every festival and family function — nothing missing, nothing extra.';

  @override
  String get onboardingSlide1Label => 'FESTIVAL KIT';

  @override
  String get onboardingSlide2Title => 'Verified Poojaris';

  @override
  String get onboardingSlide2Desc =>
      'Book experienced, background-verified priests for home visits or online consultations.';

  @override
  String get onboardingSlide2Label => 'POOJARI PORTRAIT';

  @override
  String get onboardingSlide3Title => 'Same-Day Delivery';

  @override
  String get onboardingSlide3Desc =>
      'Fresh flowers, agarbatti and ritual items from nearby pooja stores, delivered fast.';

  @override
  String get onboardingSlide3Label => 'DELIVERY VAN';

  @override
  String get onboardingSlide4Title => 'Never Miss a Festival';

  @override
  String get onboardingSlide4Desc =>
      'Personalized reminders for every festival and auspicious date, right on time.';

  @override
  String get onboardingSlide4Label => 'CALENDAR';

  @override
  String get skip => 'Skip';

  @override
  String get getStarted => 'Get Started';

  @override
  String get panchangDisclaimer =>
      'Panchang times are approximate civil calculations for general guidance. Consult your family priest for ritual muhurat timing.';

  @override
  String get panchangTithi => 'Tithi';

  @override
  String get panchangYoga => 'Yoga';

  @override
  String get panchangKarana => 'Karana';

  @override
  String get sunrise => 'Sunrise';

  @override
  String get sunset => 'Sunset';

  @override
  String get moonrise => 'Moonrise';

  @override
  String get moonset => 'Moonset';

  @override
  String get muhurats => 'Muhurats';

  @override
  String get rahuKalam => 'Rahu Kalam';

  @override
  String get yamagandam => 'Yamagandam';

  @override
  String get gulika => 'Gulika';

  @override
  String get abhijitMuhurat => 'Abhijit Muhurat';

  @override
  String get amritKalam => 'Amrit Kalam';

  @override
  String get guidanceEmptyPrompt =>
      'Save your birth profile (rasi + city) to unlock personalized daily guidance.';

  @override
  String get guidanceRecommendedPuja => 'Recommended puja';

  @override
  String get guidanceLuckyColor => 'Lucky color';

  @override
  String get guidanceDirection => 'Direction';

  @override
  String get guidanceNumber => 'Number';

  @override
  String get guidanceCareer => 'Career';

  @override
  String get guidanceFinance => 'Finance';

  @override
  String get guidanceHealth => 'Health';

  @override
  String get guidanceTravel => 'Travel';

  @override
  String get todayBadge => 'TODAY';

  @override
  String get signInToSaveBirthProfile => 'Sign in to save your birth profile';

  @override
  String get birthProfileIntro =>
      'Enter name, date, time and place. We compute your janma rāśi (Moon sign) and today\'s guidance.';

  @override
  String get fullName => 'Full name';

  @override
  String get dateOfBirth => 'Date of birth';

  @override
  String get birthTime => 'Birth time';

  @override
  String get birthPlaceCity => 'Birth place (city)';

  @override
  String get birthPlaceHint => 'Hyderabad, Bengaluru, …';

  @override
  String get cityForDailyPanchang => 'City for daily panchang';

  @override
  String get computingRasi => 'Computing rāśi…';

  @override
  String get fetchRasiPalalu => 'Fetch Rasi Palalu';

  @override
  String get rasiMoonSign => 'Rāśi (Moon sign)';

  @override
  String get nakshatra => 'Nakshatra';

  @override
  String get gotramOptional => 'Gotram (optional)';

  @override
  String get todayForYourRasi => 'Today for your rāśi';

  @override
  String get guidanceSummary => 'Summary';

  @override
  String get deliveryAddress => 'Delivery Address';

  @override
  String get addressLine => 'Address line';

  @override
  String get city => 'City';

  @override
  String get state => 'State';

  @override
  String get postalCode => 'Postal code';

  @override
  String get ifBoughtSeparately => 'If bought separately';

  @override
  String individualPricesKit(String price) {
    return 'Individual prices · kit $price';
  }

  @override
  String get festivalToday => 'TODAY';

  @override
  String get festivalInOneDay => 'IN 1 DAY';

  @override
  String festivalInDays(int days) {
    return 'IN $days DAYS';
  }

  @override
  String panchangNote(String note) {
    return 'Note: $note';
  }

  @override
  String gotramNakshatramLine(String gotram, String nakshatram) {
    return 'Gotram: $gotram · Nakshatram: $nakshatram';
  }

  @override
  String get sessionExpired => 'Session expired. Please sign in again.';

  @override
  String get enterDobFormat => 'Enter date of birth as YYYY-MM-DD';

  @override
  String get enterBirthTimeFormat => 'Enter birth time as HH:MM';

  @override
  String get selectCityCoordinates =>
      'Select a city for birth place coordinates';

  @override
  String get enterValidDob => 'Enter a valid date of birth (YYYY-MM-DD)';

  @override
  String get birthTimeHhMm => 'Birth time must be HH:MM (24-hour)';

  @override
  String get checkDateTimeRetry =>
      'Check date (YYYY-MM-DD) and time (HH:MM), then try again.';

  @override
  String janmaRasiLagna(String rasi, String lagna) {
    return 'Janma rāśi: $rasi · Lagna: $lagna';
  }

  @override
  String get guidanceLuckyDirection => 'Lucky direction';

  @override
  String get guidanceLuckyNumber => 'Lucky number';

  @override
  String get scanPoojariListTitle => 'Scan poojari list';

  @override
  String get scanPoojariListIntro =>
      'Upload a photo or paste the poojari’s written list. We’ll read the items and match them to samagri in the shop.';

  @override
  String get scanTakePhoto => 'Take photo';

  @override
  String get scanChoosePhoto => 'Gallery';

  @override
  String get scanPasteListLabel => 'Or paste list text';

  @override
  String get scanPasteListHint =>
      'Pasupu, Kumkum, Ghee, Neiyy… (Telugu or English)';

  @override
  String get scanFindItems => 'Find items';

  @override
  String get scanReadingList => 'Reading list…';

  @override
  String get scanExtractedText => 'Extracted text';

  @override
  String get scanNoTextFound => 'No text found.';

  @override
  String scanMatchedItems(int count) {
    return 'Matched items ($count)';
  }

  @override
  String get scanNoMatches =>
      'No samagri items matched. Try clearer text or paste one item per line.';

  @override
  String get scanUnmatchedLines => 'Could not match these lines';

  @override
  String scanSelectedTotal(String total) {
    return 'Selected total: $total';
  }

  @override
  String get scanAddToCart => 'Add to cart';

  @override
  String get scanAddedToCart => 'Matched samagri added to cart';

  @override
  String get scanSelectItemsError => 'Select at least one matched item.';

  @override
  String get scanSignInToAdd => 'Sign in to add scanned samagri to your cart';

  @override
  String get scanListEmptyError =>
      'Paste the poojari list or upload a photo first.';

  @override
  String get addingToCart => 'Adding…';

  @override
  String get scanListAction => 'Scan list';

  @override
  String get scanSavedLists => 'Saved lists';

  @override
  String get scanSaveForNextPuja => 'Save for next puja';

  @override
  String get scanSaveListTitle => 'List name';

  @override
  String get scanSaveListHint => 'Ganesh puja list';

  @override
  String get scanListSaved => 'List saved for next puja';

  @override
  String get scanSignInToSaveList => 'Sign in to save this list';

  @override
  String get scanQty => 'Qty';

  @override
  String get scanDidYouMean => 'Did you mean?';

  @override
  String get scanDeleteSavedList => 'Delete saved list';

  @override
  String get scanNoSavedLists => 'No saved lists yet';

  @override
  String get samagriTwoOptionsIntro =>
      'Upload your poojari’s written list, or open a list your poojari sent you in the app after booking.';

  @override
  String get poojariSamagriTitle => 'Send samagri list';

  @override
  String get poojariSamagriIntro =>
      'Type or paste the samagri items. The devotee will see this list in their app and can add items to cart.';

  @override
  String poojariSamagriIntroFor(String devotee) {
    return 'Send samagri items to $devotee. They will see this list in the app and can add to cart.';
  }

  @override
  String get poojariSamagriSend => 'Send to devotee';

  @override
  String get poojariSamagriSent => 'Samagri list sent to devotee';

  @override
  String get receivedSamagriLists => 'From your poojari';

  @override
  String get receivedSamagriTitle => 'Poojari samagri list';

  @override
  String receivedSamagriFrom(String priestName) {
    return 'From $priestName';
  }

  @override
  String get receivedSamagriNew => 'NEW';

  @override
  String get notificationsEmpty => 'No notifications yet';

  @override
  String get notificationsSignIn => 'Sign in to see your notifications';

  @override
  String get notificationsMarkAllRead => 'Mark all read';
}
