// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Pooja Store';

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
      'Everyday items, Ganesh homam, and Varalakshmi kits';

  @override
  String get homeOrdersTitle => 'My Orders';

  @override
  String get homeOrdersSubtitle => 'Track paid kits and bookings';

  @override
  String get homeComingNext =>
      'Coming next: full vendor marketplace onboarding.';

  @override
  String get loginSubtitle => 'Sign in with your mobile number';

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
}
