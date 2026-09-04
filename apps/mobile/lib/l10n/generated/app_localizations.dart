import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_te.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('te'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Pavitra Seva'**
  String get appTitle;

  /// No description provided for @languageEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @languageTelugu.
  ///
  /// In en, this message translates to:
  /// **'తెలుగు'**
  String get languageTelugu;

  /// No description provided for @cart.
  ///
  /// In en, this message translates to:
  /// **'Cart'**
  String get cart;

  /// No description provided for @adminOps.
  ///
  /// In en, this message translates to:
  /// **'Admin ops'**
  String get adminOps;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @namaste.
  ///
  /// In en, this message translates to:
  /// **'Namaste'**
  String get namaste;

  /// No description provided for @namasteName.
  ///
  /// In en, this message translates to:
  /// **'Namaste, {name}'**
  String namasteName(String name);

  /// No description provided for @homePanchangTitle.
  ///
  /// In en, this message translates to:
  /// **'Panchang & Zodiac'**
  String get homePanchangTitle;

  /// No description provided for @homePanchangSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Today’s tithi, muhurats, and rasi guidance'**
  String get homePanchangSubtitle;

  /// No description provided for @homeVidhiTitle.
  ///
  /// In en, this message translates to:
  /// **'Puja Vidhi'**
  String get homeVidhiTitle;

  /// No description provided for @homeVidhiSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Step-by-step procedures, mantras, and katha'**
  String get homeVidhiSubtitle;

  /// No description provided for @homeKidsTitle.
  ///
  /// In en, this message translates to:
  /// **'Kids Corner'**
  String get homeKidsTitle;

  /// No description provided for @homeKidsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Festival stories and fun quizzes for all ages'**
  String get homeKidsSubtitle;

  /// No description provided for @homePriestsTitle.
  ///
  /// In en, this message translates to:
  /// **'Book a Priest'**
  String get homePriestsTitle;

  /// No description provided for @homePriestsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Find pandits, pick a slot, pay in-app'**
  String get homePriestsSubtitle;

  /// No description provided for @homeGuidesTitle.
  ///
  /// In en, this message translates to:
  /// **'Prasad & Vrat'**
  String get homeGuidesTitle;

  /// No description provided for @homeGuidesSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Fasting rules, recipes, and orderable prasad'**
  String get homeGuidesSubtitle;

  /// No description provided for @homePackagesTitle.
  ///
  /// In en, this message translates to:
  /// **'Puja Packages'**
  String get homePackagesTitle;

  /// No description provided for @homePackagesSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Kit + priest + prasad + add-ons, one payment'**
  String get homePackagesSubtitle;

  /// No description provided for @homeKitsTitle.
  ///
  /// In en, this message translates to:
  /// **'Puja Kits'**
  String get homeKitsTitle;

  /// No description provided for @homeKitsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Buy festival & occasion kits with in-app payment'**
  String get homeKitsSubtitle;

  /// No description provided for @homeSamagriTitle.
  ///
  /// In en, this message translates to:
  /// **'Pooja Samagri'**
  String get homeSamagriTitle;

  /// No description provided for @homeSamagriSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Festival & daily pooja essentials under one catalogue.'**
  String get homeSamagriSubtitle;

  /// No description provided for @homeOrdersTitle.
  ///
  /// In en, this message translates to:
  /// **'My Orders'**
  String get homeOrdersTitle;

  /// No description provided for @homeOrdersSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Track paid kits and bookings'**
  String get homeOrdersSubtitle;

  /// No description provided for @homeComingNext.
  ///
  /// In en, this message translates to:
  /// **'Coming next: full vendor marketplace onboarding.'**
  String get homeComingNext;

  /// No description provided for @loginSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in with your email and password'**
  String get loginSubtitle;

  /// No description provided for @loginOtpSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Enter the OTP sent to your phone'**
  String get loginOtpSubtitle;

  /// No description provided for @country.
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get country;

  /// No description provided for @countryIndia.
  ///
  /// In en, this message translates to:
  /// **'India (+91)'**
  String get countryIndia;

  /// No description provided for @countryUsCa.
  ///
  /// In en, this message translates to:
  /// **'USA / Canada (+1)'**
  String get countryUsCa;

  /// No description provided for @mobileNumber.
  ///
  /// In en, this message translates to:
  /// **'Mobile number'**
  String get mobileNumber;

  /// No description provided for @fullNameOptional.
  ///
  /// In en, this message translates to:
  /// **'Full name (optional)'**
  String get fullNameOptional;

  /// No description provided for @sendOtp.
  ///
  /// In en, this message translates to:
  /// **'Send OTP'**
  String get sendOtp;

  /// No description provided for @otp.
  ///
  /// In en, this message translates to:
  /// **'OTP'**
  String get otp;

  /// No description provided for @devOtp.
  ///
  /// In en, this message translates to:
  /// **'Dev OTP: {code}'**
  String devOtp(String code);

  /// No description provided for @verifyContinue.
  ///
  /// In en, this message translates to:
  /// **'Verify & Continue'**
  String get verifyContinue;

  /// No description provided for @changeNumber.
  ///
  /// In en, this message translates to:
  /// **'Change number'**
  String get changeNumber;

  /// No description provided for @kitsTitle.
  ///
  /// In en, this message translates to:
  /// **'Puja Kits'**
  String get kitsTitle;

  /// No description provided for @samagriTitle.
  ///
  /// In en, this message translates to:
  /// **'Pooja Samagri'**
  String get samagriTitle;

  /// No description provided for @samagriKitsSection.
  ///
  /// In en, this message translates to:
  /// **'Complete kits'**
  String get samagriKitsSection;

  /// No description provided for @samagriItemsSection.
  ///
  /// In en, this message translates to:
  /// **'Individual items'**
  String get samagriItemsSection;

  /// No description provided for @samagriDetails.
  ///
  /// In en, this message translates to:
  /// **'Samagri details'**
  String get samagriDetails;

  /// No description provided for @packDetails.
  ///
  /// In en, this message translates to:
  /// **'Pack details'**
  String get packDetails;

  /// No description provided for @optionalItem.
  ///
  /// In en, this message translates to:
  /// **'Optional'**
  String get optionalItem;

  /// No description provided for @noSamagri.
  ///
  /// In en, this message translates to:
  /// **'No samagri listed yet'**
  String get noSamagri;

  /// No description provided for @kitDetails.
  ///
  /// In en, this message translates to:
  /// **'Kit details'**
  String get kitDetails;

  /// No description provided for @includedItems.
  ///
  /// In en, this message translates to:
  /// **'Included items'**
  String get includedItems;

  /// No description provided for @qty.
  ///
  /// In en, this message translates to:
  /// **'Qty: {count}'**
  String qty(int count);

  /// No description provided for @addToCart.
  ///
  /// In en, this message translates to:
  /// **'Add to cart'**
  String get addToCart;

  /// No description provided for @addedToCart.
  ///
  /// In en, this message translates to:
  /// **'Added to cart'**
  String get addedToCart;

  /// No description provided for @emptyCart.
  ///
  /// In en, this message translates to:
  /// **'Your cart is empty'**
  String get emptyCart;

  /// No description provided for @browseKits.
  ///
  /// In en, this message translates to:
  /// **'Browse kits'**
  String get browseKits;

  /// No description provided for @proceedToCheckout.
  ///
  /// In en, this message translates to:
  /// **'Proceed to checkout'**
  String get proceedToCheckout;

  /// No description provided for @checkout.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get checkout;

  /// No description provided for @selectAddress.
  ///
  /// In en, this message translates to:
  /// **'Select a delivery address'**
  String get selectAddress;

  /// No description provided for @payNow.
  ///
  /// In en, this message translates to:
  /// **'Pay now'**
  String get payNow;

  /// No description provided for @processing.
  ///
  /// In en, this message translates to:
  /// **'Processing…'**
  String get processing;

  /// No description provided for @paymentSuccessMock.
  ///
  /// In en, this message translates to:
  /// **'Payment successful (mock)'**
  String get paymentSuccessMock;

  /// No description provided for @paymentRedirect.
  ///
  /// In en, this message translates to:
  /// **'Complete payment in the gateway, then return here. Webhooks confirm the order.'**
  String get paymentRedirect;

  /// No description provided for @myOrders.
  ///
  /// In en, this message translates to:
  /// **'My Orders'**
  String get myOrders;

  /// No description provided for @noOrdersYet.
  ///
  /// In en, this message translates to:
  /// **'No orders yet'**
  String get noOrdersYet;

  /// No description provided for @vidhiTitle.
  ///
  /// In en, this message translates to:
  /// **'Puja Vidhi'**
  String get vidhiTitle;

  /// No description provided for @categoryAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get categoryAll;

  /// No description provided for @categoryOccasion.
  ///
  /// In en, this message translates to:
  /// **'Occasion'**
  String get categoryOccasion;

  /// No description provided for @categoryFestival.
  ///
  /// In en, this message translates to:
  /// **'Festival'**
  String get categoryFestival;

  /// No description provided for @categoryDaily.
  ///
  /// In en, this message translates to:
  /// **'Daily'**
  String get categoryDaily;

  /// No description provided for @categoryVrat.
  ///
  /// In en, this message translates to:
  /// **'Vrat'**
  String get categoryVrat;

  /// No description provided for @noVidhis.
  ///
  /// In en, this message translates to:
  /// **'No vidhis published yet'**
  String get noVidhis;

  /// No description provided for @vidhiMeta.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min · {difficulty} · {steps} steps'**
  String vidhiMeta(int minutes, String difficulty, int steps);

  /// No description provided for @katha.
  ///
  /// In en, this message translates to:
  /// **'Katha'**
  String get katha;

  /// No description provided for @getRelatedKit.
  ///
  /// In en, this message translates to:
  /// **'Get related puja kit'**
  String get getRelatedKit;

  /// No description provided for @startSteps.
  ///
  /// In en, this message translates to:
  /// **'Start {count} steps'**
  String startSteps(int count);

  /// No description provided for @noSteps.
  ///
  /// In en, this message translates to:
  /// **'No steps available'**
  String get noSteps;

  /// No description provided for @transliteration.
  ///
  /// In en, this message translates to:
  /// **'Transliteration'**
  String get transliteration;

  /// No description provided for @meaning.
  ///
  /// In en, this message translates to:
  /// **'Meaning'**
  String get meaning;

  /// No description provided for @previous.
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get previous;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @done.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get done;

  /// No description provided for @bestTime.
  ///
  /// In en, this message translates to:
  /// **'Best time'**
  String get bestTime;

  /// No description provided for @duration.
  ///
  /// In en, this message translates to:
  /// **'Duration'**
  String get duration;

  /// No description provided for @difficulty.
  ///
  /// In en, this message translates to:
  /// **'Difficulty'**
  String get difficulty;

  /// No description provided for @kidsTitle.
  ///
  /// In en, this message translates to:
  /// **'Kids Corner'**
  String get kidsTitle;

  /// No description provided for @myProgress.
  ///
  /// In en, this message translates to:
  /// **'My progress'**
  String get myProgress;

  /// No description provided for @noStories.
  ///
  /// In en, this message translates to:
  /// **'No stories yet'**
  String get noStories;

  /// No description provided for @kidsProgressTitle.
  ///
  /// In en, this message translates to:
  /// **'Kids progress'**
  String get kidsProgressTitle;

  /// No description provided for @kidsProgressEmpty.
  ///
  /// In en, this message translates to:
  /// **'Complete a story or quiz to see progress here.'**
  String get kidsProgressEmpty;

  /// No description provided for @storyCompleted.
  ///
  /// In en, this message translates to:
  /// **'Story completed — great job!'**
  String get storyCompleted;

  /// No description provided for @back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// No description provided for @takeQuiz.
  ///
  /// In en, this message translates to:
  /// **'Take quiz'**
  String get takeQuiz;

  /// No description provided for @markComplete.
  ///
  /// In en, this message translates to:
  /// **'Mark story complete'**
  String get markComplete;

  /// No description provided for @whyCelebrated.
  ///
  /// In en, this message translates to:
  /// **'Why we celebrate'**
  String get whyCelebrated;

  /// No description provided for @importance.
  ///
  /// In en, this message translates to:
  /// **'Why it matters'**
  String get importance;

  /// No description provided for @answerEveryQuestion.
  ///
  /// In en, this message translates to:
  /// **'Please answer every question'**
  String get answerEveryQuestion;

  /// No description provided for @quizResult.
  ///
  /// In en, this message translates to:
  /// **'Quiz result'**
  String get quizResult;

  /// No description provided for @quizWellDone.
  ///
  /// In en, this message translates to:
  /// **'Well done!'**
  String get quizWellDone;

  /// No description provided for @quizRetry.
  ///
  /// In en, this message translates to:
  /// **'Good try — read again and retry'**
  String get quizRetry;

  /// No description provided for @quizScore.
  ///
  /// In en, this message translates to:
  /// **'Score: {score} / {total} (pass {passScore})'**
  String quizScore(int score, int total, int passScore);

  /// No description provided for @backToKids.
  ///
  /// In en, this message translates to:
  /// **'Back to Kids Corner'**
  String get backToKids;

  /// No description provided for @checking.
  ///
  /// In en, this message translates to:
  /// **'Checking…'**
  String get checking;

  /// No description provided for @submitAnswers.
  ///
  /// In en, this message translates to:
  /// **'Submit answers'**
  String get submitAnswers;

  /// No description provided for @ageLittle.
  ///
  /// In en, this message translates to:
  /// **'Little'**
  String get ageLittle;

  /// No description provided for @ageJunior.
  ///
  /// In en, this message translates to:
  /// **'Junior'**
  String get ageJunior;

  /// No description provided for @ageTeen.
  ///
  /// In en, this message translates to:
  /// **'Teen'**
  String get ageTeen;

  /// No description provided for @bookPriest.
  ///
  /// In en, this message translates to:
  /// **'Book a Priest'**
  String get bookPriest;

  /// No description provided for @myBookings.
  ///
  /// In en, this message translates to:
  /// **'My bookings'**
  String get myBookings;

  /// No description provided for @yearsExp.
  ///
  /// In en, this message translates to:
  /// **'{years} yrs'**
  String yearsExp(int years);

  /// No description provided for @languagesLabel.
  ///
  /// In en, this message translates to:
  /// **'Languages: {list}'**
  String languagesLabel(String list);

  /// No description provided for @noOpenSlots.
  ///
  /// In en, this message translates to:
  /// **'No open slots right now'**
  String get noOpenSlots;

  /// No description provided for @booking.
  ///
  /// In en, this message translates to:
  /// **'Booking…'**
  String get booking;

  /// No description provided for @bookAndPay.
  ///
  /// In en, this message translates to:
  /// **'Book & pay'**
  String get bookAndPay;

  /// No description provided for @cancelBookingTitle.
  ///
  /// In en, this message translates to:
  /// **'Cancel booking?'**
  String get cancelBookingTitle;

  /// No description provided for @cancelBookingBody.
  ///
  /// In en, this message translates to:
  /// **'This slot will be released. Paid bookings may need an admin refund.'**
  String get cancelBookingBody;

  /// No description provided for @keep.
  ///
  /// In en, this message translates to:
  /// **'Keep'**
  String get keep;

  /// No description provided for @cancelBooking.
  ///
  /// In en, this message translates to:
  /// **'Cancel booking'**
  String get cancelBooking;

  /// No description provided for @bookingCancelled.
  ///
  /// In en, this message translates to:
  /// **'Booking cancelled'**
  String get bookingCancelled;

  /// No description provided for @myPriestBookings.
  ///
  /// In en, this message translates to:
  /// **'My priest bookings'**
  String get myPriestBookings;

  /// No description provided for @noBookingsYet.
  ///
  /// In en, this message translates to:
  /// **'No bookings yet'**
  String get noBookingsYet;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @guidesTitle.
  ///
  /// In en, this message translates to:
  /// **'Prasad & Vrat'**
  String get guidesTitle;

  /// No description provided for @tabVrat.
  ///
  /// In en, this message translates to:
  /// **'Vrat'**
  String get tabVrat;

  /// No description provided for @tabPrasad.
  ///
  /// In en, this message translates to:
  /// **'Prasad'**
  String get tabPrasad;

  /// No description provided for @upcoming.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get upcoming;

  /// No description provided for @noUpcoming.
  ///
  /// In en, this message translates to:
  /// **'No upcoming dates seeded yet'**
  String get noUpcoming;

  /// No description provided for @allVrats.
  ///
  /// In en, this message translates to:
  /// **'All vrats'**
  String get allVrats;

  /// No description provided for @orderable.
  ///
  /// In en, this message translates to:
  /// **'orderable'**
  String get orderable;

  /// No description provided for @minServings.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min · {servings} servings'**
  String minServings(int minutes, int servings);

  /// No description provided for @packagesTitle.
  ///
  /// In en, this message translates to:
  /// **'Puja Packages'**
  String get packagesTitle;

  /// No description provided for @packageBooked.
  ///
  /// In en, this message translates to:
  /// **'Package booked successfully'**
  String get packageBooked;

  /// No description provided for @pujaKit.
  ///
  /// In en, this message translates to:
  /// **'Puja kit'**
  String get pujaKit;

  /// No description provided for @priestVisit.
  ///
  /// In en, this message translates to:
  /// **'Priest visit'**
  String get priestVisit;

  /// No description provided for @addOns.
  ///
  /// In en, this message translates to:
  /// **'Add-ons'**
  String get addOns;

  /// No description provided for @bookPackagePay.
  ///
  /// In en, this message translates to:
  /// **'Book package & pay'**
  String get bookPackagePay;

  /// No description provided for @myPackageBookings.
  ///
  /// In en, this message translates to:
  /// **'My package bookings'**
  String get myPackageBookings;

  /// No description provided for @noPackageBookings.
  ///
  /// In en, this message translates to:
  /// **'No package bookings yet'**
  String get noPackageBookings;

  /// No description provided for @cancelPackageTitle.
  ///
  /// In en, this message translates to:
  /// **'Cancel package?'**
  String get cancelPackageTitle;

  /// No description provided for @cancelPackageBody.
  ///
  /// In en, this message translates to:
  /// **'Linked priest slots will be released. Refunds are handled by admin if already paid.'**
  String get cancelPackageBody;

  /// No description provided for @cancelPackage.
  ///
  /// In en, this message translates to:
  /// **'Cancel package'**
  String get cancelPackage;

  /// No description provided for @packageCancelled.
  ///
  /// In en, this message translates to:
  /// **'Package booking cancelled'**
  String get packageCancelled;

  /// No description provided for @panchangTitle.
  ///
  /// In en, this message translates to:
  /// **'Panchang & Zodiac'**
  String get panchangTitle;

  /// No description provided for @birthProfile.
  ///
  /// In en, this message translates to:
  /// **'Birth profile'**
  String get birthProfile;

  /// No description provided for @tabToday.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get tabToday;

  /// No description provided for @tabGuidance.
  ///
  /// In en, this message translates to:
  /// **'Guidance'**
  String get tabGuidance;

  /// No description provided for @tabCalendar.
  ///
  /// In en, this message translates to:
  /// **'Calendar'**
  String get tabCalendar;

  /// No description provided for @festivals.
  ///
  /// In en, this message translates to:
  /// **'Festivals'**
  String get festivals;

  /// No description provided for @setBirthProfile.
  ///
  /// In en, this message translates to:
  /// **'Set birth profile'**
  String get setBirthProfile;

  /// No description provided for @birthProfileSaved.
  ///
  /// In en, this message translates to:
  /// **'Birth profile saved'**
  String get birthProfileSaved;

  /// No description provided for @saving.
  ///
  /// In en, this message translates to:
  /// **'Saving…'**
  String get saving;

  /// No description provided for @saveProfile.
  ///
  /// In en, this message translates to:
  /// **'Save profile'**
  String get saveProfile;

  /// No description provided for @adminUsers.
  ///
  /// In en, this message translates to:
  /// **'Users'**
  String get adminUsers;

  /// No description provided for @adminUsersSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Suspend / activate accounts'**
  String get adminUsersSubtitle;

  /// No description provided for @adminOrders.
  ///
  /// In en, this message translates to:
  /// **'Orders'**
  String get adminOrders;

  /// No description provided for @adminOrdersSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Browse recent commerce orders'**
  String get adminOrdersSubtitle;

  /// No description provided for @adminBookings.
  ///
  /// In en, this message translates to:
  /// **'Priest bookings'**
  String get adminBookings;

  /// No description provided for @adminBookingsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Ops list of pandit bookings'**
  String get adminBookingsSubtitle;

  /// No description provided for @adminOrdersTitle.
  ///
  /// In en, this message translates to:
  /// **'Admin orders'**
  String get adminOrdersTitle;

  /// No description provided for @adminBookingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Admin priest bookings'**
  String get adminBookingsTitle;

  /// No description provided for @refresh.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get refresh;

  /// No description provided for @signIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get signIn;

  /// No description provided for @guest.
  ///
  /// In en, this message translates to:
  /// **'Guest'**
  String get guest;

  /// No description provided for @homeTodayPanchang.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Panchang'**
  String get homeTodayPanchang;

  /// No description provided for @homeUpcomingFestivals.
  ///
  /// In en, this message translates to:
  /// **'Upcoming Festivals'**
  String get homeUpcomingFestivals;

  /// No description provided for @homeFestivalsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Complete Pooja Samagri kits for each festival — ready to book.'**
  String get homeFestivalsSubtitle;

  /// No description provided for @bookSamagriKit.
  ///
  /// In en, this message translates to:
  /// **'Book samagri kit'**
  String get bookSamagriKit;

  /// No description provided for @viewAll.
  ///
  /// In en, this message translates to:
  /// **'View all'**
  String get viewAll;

  /// No description provided for @homeMoreServices.
  ///
  /// In en, this message translates to:
  /// **'More Services'**
  String get homeMoreServices;

  /// No description provided for @comingSoonBadge.
  ///
  /// In en, this message translates to:
  /// **'SOON'**
  String get comingSoonBadge;

  /// No description provided for @panchangShortTitle.
  ///
  /// In en, this message translates to:
  /// **'Panchang'**
  String get panchangShortTitle;

  /// No description provided for @panchangSunriseRahuKalam.
  ///
  /// In en, this message translates to:
  /// **'Sunrise {sunrise} · Rahu Kalam {rahu}'**
  String panchangSunriseRahuKalam(String sunrise, String rahu);

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navSamagri.
  ///
  /// In en, this message translates to:
  /// **'Samagri'**
  String get navSamagri;

  /// No description provided for @navPoojaris.
  ///
  /// In en, this message translates to:
  /// **'Poojaris'**
  String get navPoojaris;

  /// No description provided for @navAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get navAccount;

  /// No description provided for @profileGuestTitle.
  ///
  /// In en, this message translates to:
  /// **'Explore freely'**
  String get profileGuestTitle;

  /// No description provided for @profileGuestSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Browse festivals and Pooja Samagri without signing in. Sign in when you are ready to checkout.'**
  String get profileGuestSubtitle;

  /// No description provided for @signInRegister.
  ///
  /// In en, this message translates to:
  /// **'Sign in / Register'**
  String get signInRegister;

  /// No description provided for @browseSamagri.
  ///
  /// In en, this message translates to:
  /// **'Browse Pooja Samagri'**
  String get browseSamagri;

  /// No description provided for @devotee.
  ///
  /// In en, this message translates to:
  /// **'Devotee'**
  String get devotee;

  /// No description provided for @profileTitle.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileTitle;

  /// No description provided for @edit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// No description provided for @personalDetails.
  ///
  /// In en, this message translates to:
  /// **'Personal Details'**
  String get personalDetails;

  /// No description provided for @savedAddresses.
  ///
  /// In en, this message translates to:
  /// **'Saved Addresses'**
  String get savedAddresses;

  /// No description provided for @familyMembers.
  ///
  /// In en, this message translates to:
  /// **'Family Members'**
  String get familyMembers;

  /// No description provided for @orderHistory.
  ///
  /// In en, this message translates to:
  /// **'Order History'**
  String get orderHistory;

  /// No description provided for @pujariDesk.
  ///
  /// In en, this message translates to:
  /// **'Pujari Desk'**
  String get pujariDesk;

  /// No description provided for @joinAsPujari.
  ///
  /// In en, this message translates to:
  /// **'Join as a pujari'**
  String get joinAsPujari;

  /// No description provided for @admin.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get admin;

  /// No description provided for @priestBookingHistory.
  ///
  /// In en, this message translates to:
  /// **'Priest Booking History'**
  String get priestBookingHistory;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @wishlist.
  ///
  /// In en, this message translates to:
  /// **'Wishlist'**
  String get wishlist;

  /// No description provided for @support.
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get support;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @darkMode.
  ///
  /// In en, this message translates to:
  /// **'Dark Mode'**
  String get darkMode;

  /// No description provided for @logOut.
  ///
  /// In en, this message translates to:
  /// **'Log Out'**
  String get logOut;

  /// No description provided for @emptyCartBrowseSamagri.
  ///
  /// In en, this message translates to:
  /// **'Browse Pooja Samagri to get started.'**
  String get emptyCartBrowseSamagri;

  /// No description provided for @cartQtyLine.
  ///
  /// In en, this message translates to:
  /// **'Qty {qty} · {price}'**
  String cartQtyLine(int qty, String price);

  /// No description provided for @remove.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get remove;

  /// No description provided for @itemsSubtotal.
  ///
  /// In en, this message translates to:
  /// **'Items subtotal'**
  String get itemsSubtotal;

  /// No description provided for @deliveryCharge.
  ///
  /// In en, this message translates to:
  /// **'Delivery charge'**
  String get deliveryCharge;

  /// No description provided for @total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get total;

  /// No description provided for @about.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get about;

  /// No description provided for @speciality.
  ///
  /// In en, this message translates to:
  /// **'Speciality'**
  String get speciality;

  /// No description provided for @howToDoPooja.
  ///
  /// In en, this message translates to:
  /// **'How to do the Pooja'**
  String get howToDoPooja;

  /// No description provided for @poojaGuidesTitle.
  ///
  /// In en, this message translates to:
  /// **'Pooja samagri by pooja'**
  String get poojaGuidesTitle;

  /// No description provided for @poojaGuidesSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Start with the basic kit used in every home pooja. Add a deity or festival kit only for the extras that pooja needs.'**
  String get poojaGuidesSubtitle;

  /// No description provided for @commonSamagriTitle.
  ///
  /// In en, this message translates to:
  /// **'Common items'**
  String get commonSamagriTitle;

  /// No description provided for @deityPoojaTitle.
  ///
  /// In en, this message translates to:
  /// **'Deity'**
  String get deityPoojaTitle;

  /// No description provided for @festivalPoojaTitle.
  ///
  /// In en, this message translates to:
  /// **'Festivals'**
  String get festivalPoojaTitle;

  /// No description provided for @vrathamPoojaTitle.
  ///
  /// In en, this message translates to:
  /// **'Vratams'**
  String get vrathamPoojaTitle;

  /// No description provided for @specialForThisPooja.
  ///
  /// In en, this message translates to:
  /// **'Special items for this pooja'**
  String get specialForThisPooja;

  /// No description provided for @pairWithBasicKit.
  ///
  /// In en, this message translates to:
  /// **'Buy basic pooja kit'**
  String get pairWithBasicKit;

  /// No description provided for @pairWithBasicHint.
  ///
  /// In en, this message translates to:
  /// **'These extras go with the common samagri — turmeric, kumkum, flowers, camphor, and the rest of the basic kit.'**
  String get pairWithBasicHint;

  /// No description provided for @deitySpecificKit.
  ///
  /// In en, this message translates to:
  /// **'Deity extras kit'**
  String get deitySpecificKit;

  /// No description provided for @festivalVrathamKit.
  ///
  /// In en, this message translates to:
  /// **'Festival / vratam kit'**
  String get festivalVrathamKit;

  /// No description provided for @commonItemsAlsoNeeded.
  ///
  /// In en, this message translates to:
  /// **'Also keep the everyday pooja items (listed under Common).'**
  String get commonItemsAlsoNeeded;

  /// No description provided for @viewCommonSamagri.
  ///
  /// In en, this message translates to:
  /// **'View common samagri'**
  String get viewCommonSamagri;

  /// No description provided for @poojaGuideDisclaimer.
  ///
  /// In en, this message translates to:
  /// **'Items can vary by region, family custom, and your pujari’s vidhi.'**
  String get poojaGuideDisclaimer;

  /// No description provided for @browsePoojaGuides.
  ///
  /// In en, this message translates to:
  /// **'Browse by pooja'**
  String get browsePoojaGuides;

  /// No description provided for @requiredItems.
  ///
  /// In en, this message translates to:
  /// **'Required Items'**
  String get requiredItems;

  /// No description provided for @chooseOptionalItems.
  ///
  /// In en, this message translates to:
  /// **'Choose optional items'**
  String get chooseOptionalItems;

  /// No description provided for @optionalItemsHint.
  ///
  /// In en, this message translates to:
  /// **'These are not packed unless you select them.'**
  String get optionalItemsHint;

  /// No description provided for @ganeshPoojaItemsTab.
  ///
  /// In en, this message translates to:
  /// **'Home Puja'**
  String get ganeshPoojaItemsTab;

  /// No description provided for @ganeshHomamTab.
  ///
  /// In en, this message translates to:
  /// **'Homam'**
  String get ganeshHomamTab;

  /// No description provided for @ganeshPoojaListTitle.
  ///
  /// In en, this message translates to:
  /// **'Ganesh Chaturthi Home Puja'**
  String get ganeshPoojaListTitle;

  /// No description provided for @ganeshHomamListTitle.
  ///
  /// In en, this message translates to:
  /// **'Ganesh Homam Samagri'**
  String get ganeshHomamListTitle;

  /// No description provided for @completePoojaKit.
  ///
  /// In en, this message translates to:
  /// **'Complete Pooja Kit'**
  String get completePoojaKit;

  /// No description provided for @bookPoojari.
  ///
  /// In en, this message translates to:
  /// **'Book Poojari'**
  String get bookPoojari;

  /// No description provided for @signInToAddCart.
  ///
  /// In en, this message translates to:
  /// **'Sign in to add samagri to your cart'**
  String get signInToAddCart;

  /// No description provided for @selectAtLeastOneItem.
  ///
  /// In en, this message translates to:
  /// **'Select at least one pooja item.'**
  String get selectAtLeastOneItem;

  /// No description provided for @kitNotFound.
  ///
  /// In en, this message translates to:
  /// **'Kit not found'**
  String get kitNotFound;

  /// No description provided for @selectPoojaItems.
  ///
  /// In en, this message translates to:
  /// **'Select pooja items'**
  String get selectPoojaItems;

  /// No description provided for @addItemsToCart.
  ///
  /// In en, this message translates to:
  /// **'Add {count} items to cart'**
  String addItemsToCart(int count);

  /// No description provided for @completeFestivalSamagri.
  ///
  /// In en, this message translates to:
  /// **'Complete festival samagri'**
  String get completeFestivalSamagri;

  /// No description provided for @itemsIncluded.
  ///
  /// In en, this message translates to:
  /// **'{count} items included'**
  String itemsIncluded(int count);

  /// No description provided for @loginHeaderSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Devotees and pujaris sign in with email, Google, or Apple'**
  String get loginHeaderSubtitle;

  /// No description provided for @welcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get welcome;

  /// No description provided for @loginWelcomeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in to continue your seva'**
  String get loginWelcomeSubtitle;

  /// No description provided for @emailLabel.
  ///
  /// In en, this message translates to:
  /// **'EMAIL'**
  String get emailLabel;

  /// No description provided for @emailHint.
  ///
  /// In en, this message translates to:
  /// **'you@example.com'**
  String get emailHint;

  /// No description provided for @passwordLabel.
  ///
  /// In en, this message translates to:
  /// **'PASSWORD'**
  String get passwordLabel;

  /// No description provided for @passwordHint.
  ///
  /// In en, this message translates to:
  /// **'At least 8 characters'**
  String get passwordHint;

  /// No description provided for @signInButton.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get signInButton;

  /// No description provided for @signInValidation.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email and a password of at least 8 characters.'**
  String get signInValidation;

  /// No description provided for @noAccountSignUp.
  ///
  /// In en, this message translates to:
  /// **'New here? Create an account'**
  String get noAccountSignUp;

  /// No description provided for @createAccountTitle.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get createAccountTitle;

  /// No description provided for @createAccountSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Email, password, and mobile number'**
  String get createAccountSubtitle;

  /// No description provided for @createAccountButton.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get createAccountButton;

  /// No description provided for @signUpValidation.
  ///
  /// In en, this message translates to:
  /// **'Enter email, a password of at least 8 characters, and your mobile number.'**
  String get signUpValidation;

  /// No description provided for @haveAccountSignIn.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? Sign in'**
  String get haveAccountSignIn;

  /// No description provided for @mobileNumberLabel.
  ///
  /// In en, this message translates to:
  /// **'MOBILE NUMBER'**
  String get mobileNumberLabel;

  /// No description provided for @phoneHint.
  ///
  /// In en, this message translates to:
  /// **'98765 43210'**
  String get phoneHint;

  /// No description provided for @orContinueWith.
  ///
  /// In en, this message translates to:
  /// **'or continue with'**
  String get orContinueWith;

  /// No description provided for @continueWithGoogle.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get continueWithGoogle;

  /// No description provided for @continueWithApple.
  ///
  /// In en, this message translates to:
  /// **'Continue with Apple'**
  String get continueWithApple;

  /// No description provided for @pujariApplyPrompt.
  ///
  /// In en, this message translates to:
  /// **'Are you a pujari? Apply to join'**
  String get pujariApplyPrompt;

  /// No description provided for @termsPrivacyAgreement.
  ///
  /// In en, this message translates to:
  /// **'By continuing you agree to our Terms of Service and Privacy Policy'**
  String get termsPrivacyAgreement;

  /// No description provided for @verifyOtp.
  ///
  /// In en, this message translates to:
  /// **'Verify OTP'**
  String get verifyOtp;

  /// No description provided for @otpSentTo.
  ///
  /// In en, this message translates to:
  /// **'Sent to +91 {phone} ·'**
  String otpSentTo(String phone);

  /// No description provided for @otpDidntReceive.
  ///
  /// In en, this message translates to:
  /// **'Didn\'t receive the code?'**
  String get otpDidntReceive;

  /// No description provided for @otpResendIn.
  ///
  /// In en, this message translates to:
  /// **'Resend in {seconds}'**
  String otpResendIn(String seconds);

  /// No description provided for @otpResend.
  ///
  /// In en, this message translates to:
  /// **'Resend'**
  String get otpResend;

  /// No description provided for @onboardingSlide1Title.
  ///
  /// In en, this message translates to:
  /// **'Complete Pooja Kits'**
  String get onboardingSlide1Title;

  /// No description provided for @onboardingSlide1Desc.
  ///
  /// In en, this message translates to:
  /// **'Order curated kits for every festival and family function — nothing missing, nothing extra.'**
  String get onboardingSlide1Desc;

  /// No description provided for @onboardingSlide1Label.
  ///
  /// In en, this message translates to:
  /// **'FESTIVAL KIT'**
  String get onboardingSlide1Label;

  /// No description provided for @onboardingSlide2Title.
  ///
  /// In en, this message translates to:
  /// **'Verified Poojaris'**
  String get onboardingSlide2Title;

  /// No description provided for @onboardingSlide2Desc.
  ///
  /// In en, this message translates to:
  /// **'Book experienced, background-verified priests for home visits or online consultations.'**
  String get onboardingSlide2Desc;

  /// No description provided for @onboardingSlide2Label.
  ///
  /// In en, this message translates to:
  /// **'POOJARI PORTRAIT'**
  String get onboardingSlide2Label;

  /// No description provided for @onboardingSlide3Title.
  ///
  /// In en, this message translates to:
  /// **'Same-Day Delivery'**
  String get onboardingSlide3Title;

  /// No description provided for @onboardingSlide3Desc.
  ///
  /// In en, this message translates to:
  /// **'Fresh flowers, agarbatti and ritual items from nearby pooja stores, delivered fast.'**
  String get onboardingSlide3Desc;

  /// No description provided for @onboardingSlide3Label.
  ///
  /// In en, this message translates to:
  /// **'DELIVERY VAN'**
  String get onboardingSlide3Label;

  /// No description provided for @onboardingSlide4Title.
  ///
  /// In en, this message translates to:
  /// **'Never Miss a Festival'**
  String get onboardingSlide4Title;

  /// No description provided for @onboardingSlide4Desc.
  ///
  /// In en, this message translates to:
  /// **'Personalized reminders for every festival and auspicious date, right on time.'**
  String get onboardingSlide4Desc;

  /// No description provided for @onboardingSlide4Label.
  ///
  /// In en, this message translates to:
  /// **'CALENDAR'**
  String get onboardingSlide4Label;

  /// No description provided for @skip.
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get skip;

  /// No description provided for @getStarted.
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get getStarted;

  /// No description provided for @panchangDisclaimer.
  ///
  /// In en, this message translates to:
  /// **'Panchang times are approximate civil calculations for general guidance. Consult your family priest for ritual muhurat timing.'**
  String get panchangDisclaimer;

  /// No description provided for @panchangTithi.
  ///
  /// In en, this message translates to:
  /// **'Tithi'**
  String get panchangTithi;

  /// No description provided for @panchangYoga.
  ///
  /// In en, this message translates to:
  /// **'Yoga'**
  String get panchangYoga;

  /// No description provided for @panchangKarana.
  ///
  /// In en, this message translates to:
  /// **'Karana'**
  String get panchangKarana;

  /// No description provided for @sunrise.
  ///
  /// In en, this message translates to:
  /// **'Sunrise'**
  String get sunrise;

  /// No description provided for @sunset.
  ///
  /// In en, this message translates to:
  /// **'Sunset'**
  String get sunset;

  /// No description provided for @moonrise.
  ///
  /// In en, this message translates to:
  /// **'Moonrise'**
  String get moonrise;

  /// No description provided for @moonset.
  ///
  /// In en, this message translates to:
  /// **'Moonset'**
  String get moonset;

  /// No description provided for @muhurats.
  ///
  /// In en, this message translates to:
  /// **'Muhurats'**
  String get muhurats;

  /// No description provided for @rahuKalam.
  ///
  /// In en, this message translates to:
  /// **'Rahu Kalam'**
  String get rahuKalam;

  /// No description provided for @yamagandam.
  ///
  /// In en, this message translates to:
  /// **'Yamagandam'**
  String get yamagandam;

  /// No description provided for @gulika.
  ///
  /// In en, this message translates to:
  /// **'Gulika'**
  String get gulika;

  /// No description provided for @abhijitMuhurat.
  ///
  /// In en, this message translates to:
  /// **'Abhijit Muhurat'**
  String get abhijitMuhurat;

  /// No description provided for @amritKalam.
  ///
  /// In en, this message translates to:
  /// **'Amrit Kalam'**
  String get amritKalam;

  /// No description provided for @guidanceEmptyPrompt.
  ///
  /// In en, this message translates to:
  /// **'Save your birth profile (rasi + city) to unlock personalized daily guidance.'**
  String get guidanceEmptyPrompt;

  /// No description provided for @guidanceRecommendedPuja.
  ///
  /// In en, this message translates to:
  /// **'Recommended puja'**
  String get guidanceRecommendedPuja;

  /// No description provided for @guidanceLuckyColor.
  ///
  /// In en, this message translates to:
  /// **'Lucky color'**
  String get guidanceLuckyColor;

  /// No description provided for @guidanceDirection.
  ///
  /// In en, this message translates to:
  /// **'Direction'**
  String get guidanceDirection;

  /// No description provided for @guidanceNumber.
  ///
  /// In en, this message translates to:
  /// **'Number'**
  String get guidanceNumber;

  /// No description provided for @guidanceCareer.
  ///
  /// In en, this message translates to:
  /// **'Career'**
  String get guidanceCareer;

  /// No description provided for @guidanceFinance.
  ///
  /// In en, this message translates to:
  /// **'Finance'**
  String get guidanceFinance;

  /// No description provided for @guidanceHealth.
  ///
  /// In en, this message translates to:
  /// **'Health'**
  String get guidanceHealth;

  /// No description provided for @guidanceTravel.
  ///
  /// In en, this message translates to:
  /// **'Travel'**
  String get guidanceTravel;

  /// No description provided for @todayBadge.
  ///
  /// In en, this message translates to:
  /// **'TODAY'**
  String get todayBadge;

  /// No description provided for @signInToSaveBirthProfile.
  ///
  /// In en, this message translates to:
  /// **'Sign in to save your birth profile'**
  String get signInToSaveBirthProfile;

  /// No description provided for @birthProfileIntro.
  ///
  /// In en, this message translates to:
  /// **'Enter name, date, time and place. We compute your janma rāśi (Moon sign) and today\'s guidance.'**
  String get birthProfileIntro;

  /// No description provided for @fullName.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get fullName;

  /// No description provided for @dateOfBirth.
  ///
  /// In en, this message translates to:
  /// **'Date of birth'**
  String get dateOfBirth;

  /// No description provided for @birthTime.
  ///
  /// In en, this message translates to:
  /// **'Birth time'**
  String get birthTime;

  /// No description provided for @birthPlaceCity.
  ///
  /// In en, this message translates to:
  /// **'Birth place (city)'**
  String get birthPlaceCity;

  /// No description provided for @birthPlaceHint.
  ///
  /// In en, this message translates to:
  /// **'Hyderabad, Bengaluru, …'**
  String get birthPlaceHint;

  /// No description provided for @cityForDailyPanchang.
  ///
  /// In en, this message translates to:
  /// **'City for daily panchang'**
  String get cityForDailyPanchang;

  /// No description provided for @computingRasi.
  ///
  /// In en, this message translates to:
  /// **'Computing rāśi…'**
  String get computingRasi;

  /// No description provided for @fetchRasiPalalu.
  ///
  /// In en, this message translates to:
  /// **'Fetch Rasi Palalu'**
  String get fetchRasiPalalu;

  /// No description provided for @rasiMoonSign.
  ///
  /// In en, this message translates to:
  /// **'Rāśi (Moon sign)'**
  String get rasiMoonSign;

  /// No description provided for @nakshatra.
  ///
  /// In en, this message translates to:
  /// **'Nakshatra'**
  String get nakshatra;

  /// No description provided for @gotramOptional.
  ///
  /// In en, this message translates to:
  /// **'Gotram (optional)'**
  String get gotramOptional;

  /// No description provided for @todayForYourRasi.
  ///
  /// In en, this message translates to:
  /// **'Today for your rāśi'**
  String get todayForYourRasi;

  /// No description provided for @guidanceSummary.
  ///
  /// In en, this message translates to:
  /// **'Summary'**
  String get guidanceSummary;

  /// No description provided for @deliveryAddress.
  ///
  /// In en, this message translates to:
  /// **'Delivery Address'**
  String get deliveryAddress;

  /// No description provided for @addressLine.
  ///
  /// In en, this message translates to:
  /// **'Address line'**
  String get addressLine;

  /// No description provided for @city.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get city;

  /// No description provided for @state.
  ///
  /// In en, this message translates to:
  /// **'State'**
  String get state;

  /// No description provided for @postalCode.
  ///
  /// In en, this message translates to:
  /// **'Postal code'**
  String get postalCode;

  /// No description provided for @ifBoughtSeparately.
  ///
  /// In en, this message translates to:
  /// **'If bought separately'**
  String get ifBoughtSeparately;

  /// No description provided for @individualPricesKit.
  ///
  /// In en, this message translates to:
  /// **'Individual prices · kit {price}'**
  String individualPricesKit(String price);

  /// No description provided for @festivalToday.
  ///
  /// In en, this message translates to:
  /// **'TODAY'**
  String get festivalToday;

  /// No description provided for @festivalInOneDay.
  ///
  /// In en, this message translates to:
  /// **'IN 1 DAY'**
  String get festivalInOneDay;

  /// No description provided for @festivalInDays.
  ///
  /// In en, this message translates to:
  /// **'IN {days} DAYS'**
  String festivalInDays(int days);

  /// No description provided for @panchangNote.
  ///
  /// In en, this message translates to:
  /// **'Note: {note}'**
  String panchangNote(String note);

  /// No description provided for @gotramNakshatramLine.
  ///
  /// In en, this message translates to:
  /// **'Gotram: {gotram} · Nakshatram: {nakshatram}'**
  String gotramNakshatramLine(String gotram, String nakshatram);

  /// No description provided for @sessionExpired.
  ///
  /// In en, this message translates to:
  /// **'Session expired. Please sign in again.'**
  String get sessionExpired;

  /// No description provided for @enterDobFormat.
  ///
  /// In en, this message translates to:
  /// **'Enter date of birth as YYYY-MM-DD'**
  String get enterDobFormat;

  /// No description provided for @enterBirthTimeFormat.
  ///
  /// In en, this message translates to:
  /// **'Enter birth time as HH:MM'**
  String get enterBirthTimeFormat;

  /// No description provided for @selectCityCoordinates.
  ///
  /// In en, this message translates to:
  /// **'Select a city for birth place coordinates'**
  String get selectCityCoordinates;

  /// No description provided for @enterValidDob.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid date of birth (YYYY-MM-DD)'**
  String get enterValidDob;

  /// No description provided for @birthTimeHhMm.
  ///
  /// In en, this message translates to:
  /// **'Birth time must be HH:MM (24-hour)'**
  String get birthTimeHhMm;

  /// No description provided for @checkDateTimeRetry.
  ///
  /// In en, this message translates to:
  /// **'Check date (YYYY-MM-DD) and time (HH:MM), then try again.'**
  String get checkDateTimeRetry;

  /// No description provided for @janmaRasiLagna.
  ///
  /// In en, this message translates to:
  /// **'Janma rāśi: {rasi} · Lagna: {lagna}'**
  String janmaRasiLagna(String rasi, String lagna);

  /// No description provided for @guidanceLuckyDirection.
  ///
  /// In en, this message translates to:
  /// **'Lucky direction'**
  String get guidanceLuckyDirection;

  /// No description provided for @guidanceLuckyNumber.
  ///
  /// In en, this message translates to:
  /// **'Lucky number'**
  String get guidanceLuckyNumber;

  /// No description provided for @scanPoojariListTitle.
  ///
  /// In en, this message translates to:
  /// **'Scan poojari list'**
  String get scanPoojariListTitle;

  /// No description provided for @scanPoojariListIntro.
  ///
  /// In en, this message translates to:
  /// **'Upload a photo or paste the poojari’s written list. We’ll read the items and match them to samagri in the shop.'**
  String get scanPoojariListIntro;

  /// No description provided for @scanTakePhoto.
  ///
  /// In en, this message translates to:
  /// **'Take photo'**
  String get scanTakePhoto;

  /// No description provided for @scanChoosePhoto.
  ///
  /// In en, this message translates to:
  /// **'Gallery'**
  String get scanChoosePhoto;

  /// No description provided for @scanPasteListLabel.
  ///
  /// In en, this message translates to:
  /// **'Or paste list text'**
  String get scanPasteListLabel;

  /// No description provided for @scanPasteListHint.
  ///
  /// In en, this message translates to:
  /// **'Pasupu, Kumkum, Ghee, Neiyy… (Telugu or English)'**
  String get scanPasteListHint;

  /// No description provided for @scanFindItems.
  ///
  /// In en, this message translates to:
  /// **'Find items'**
  String get scanFindItems;

  /// No description provided for @scanReadingList.
  ///
  /// In en, this message translates to:
  /// **'Reading list…'**
  String get scanReadingList;

  /// No description provided for @scanExtractedText.
  ///
  /// In en, this message translates to:
  /// **'Extracted text'**
  String get scanExtractedText;

  /// No description provided for @scanNoTextFound.
  ///
  /// In en, this message translates to:
  /// **'No text found.'**
  String get scanNoTextFound;

  /// No description provided for @scanMatchedItems.
  ///
  /// In en, this message translates to:
  /// **'Matched items ({count})'**
  String scanMatchedItems(int count);

  /// No description provided for @scanNoMatches.
  ///
  /// In en, this message translates to:
  /// **'No samagri items matched. Try clearer text or paste one item per line.'**
  String get scanNoMatches;

  /// No description provided for @scanUnmatchedLines.
  ///
  /// In en, this message translates to:
  /// **'Could not match these lines'**
  String get scanUnmatchedLines;

  /// No description provided for @scanSelectedTotal.
  ///
  /// In en, this message translates to:
  /// **'Selected total: {total}'**
  String scanSelectedTotal(String total);

  /// No description provided for @scanAddToCart.
  ///
  /// In en, this message translates to:
  /// **'Add to cart'**
  String get scanAddToCart;

  /// No description provided for @scanAddedToCart.
  ///
  /// In en, this message translates to:
  /// **'Matched samagri added to cart'**
  String get scanAddedToCart;

  /// No description provided for @scanSelectItemsError.
  ///
  /// In en, this message translates to:
  /// **'Select at least one matched item.'**
  String get scanSelectItemsError;

  /// No description provided for @scanSignInToAdd.
  ///
  /// In en, this message translates to:
  /// **'Sign in to add scanned samagri to your cart'**
  String get scanSignInToAdd;

  /// No description provided for @scanListEmptyError.
  ///
  /// In en, this message translates to:
  /// **'Paste the poojari list or upload a photo first.'**
  String get scanListEmptyError;

  /// No description provided for @addingToCart.
  ///
  /// In en, this message translates to:
  /// **'Adding…'**
  String get addingToCart;

  /// No description provided for @scanListAction.
  ///
  /// In en, this message translates to:
  /// **'Scan list'**
  String get scanListAction;

  /// No description provided for @scanSavedLists.
  ///
  /// In en, this message translates to:
  /// **'Saved lists'**
  String get scanSavedLists;

  /// No description provided for @scanSaveForNextPuja.
  ///
  /// In en, this message translates to:
  /// **'Save for next puja'**
  String get scanSaveForNextPuja;

  /// No description provided for @scanSaveListTitle.
  ///
  /// In en, this message translates to:
  /// **'List name'**
  String get scanSaveListTitle;

  /// No description provided for @scanSaveListHint.
  ///
  /// In en, this message translates to:
  /// **'Ganesh puja list'**
  String get scanSaveListHint;

  /// No description provided for @scanListSaved.
  ///
  /// In en, this message translates to:
  /// **'List saved for next puja'**
  String get scanListSaved;

  /// No description provided for @scanSignInToSaveList.
  ///
  /// In en, this message translates to:
  /// **'Sign in to save this list'**
  String get scanSignInToSaveList;

  /// No description provided for @scanQty.
  ///
  /// In en, this message translates to:
  /// **'Qty'**
  String get scanQty;

  /// No description provided for @scanDidYouMean.
  ///
  /// In en, this message translates to:
  /// **'Did you mean?'**
  String get scanDidYouMean;

  /// No description provided for @scanDeleteSavedList.
  ///
  /// In en, this message translates to:
  /// **'Delete saved list'**
  String get scanDeleteSavedList;

  /// No description provided for @scanNoSavedLists.
  ///
  /// In en, this message translates to:
  /// **'No saved lists yet'**
  String get scanNoSavedLists;

  /// No description provided for @samagriTwoOptionsIntro.
  ///
  /// In en, this message translates to:
  /// **'Upload your poojari’s written list, or open a list your poojari sent you in the app after booking.'**
  String get samagriTwoOptionsIntro;

  /// No description provided for @poojariSamagriTitle.
  ///
  /// In en, this message translates to:
  /// **'Send samagri list'**
  String get poojariSamagriTitle;

  /// No description provided for @poojariSamagriIntro.
  ///
  /// In en, this message translates to:
  /// **'Type or paste the samagri items. The devotee will see this list in their app and can add items to cart.'**
  String get poojariSamagriIntro;

  /// No description provided for @poojariSamagriIntroFor.
  ///
  /// In en, this message translates to:
  /// **'Send samagri items to {devotee}. They will see this list in the app and can add to cart.'**
  String poojariSamagriIntroFor(String devotee);

  /// No description provided for @poojariSamagriSend.
  ///
  /// In en, this message translates to:
  /// **'Send to devotee'**
  String get poojariSamagriSend;

  /// No description provided for @poojariSamagriSent.
  ///
  /// In en, this message translates to:
  /// **'Samagri list sent to devotee'**
  String get poojariSamagriSent;

  /// No description provided for @receivedSamagriLists.
  ///
  /// In en, this message translates to:
  /// **'From your poojari'**
  String get receivedSamagriLists;

  /// No description provided for @receivedSamagriTitle.
  ///
  /// In en, this message translates to:
  /// **'Poojari samagri list'**
  String get receivedSamagriTitle;

  /// No description provided for @receivedSamagriFrom.
  ///
  /// In en, this message translates to:
  /// **'From {priestName}'**
  String receivedSamagriFrom(String priestName);

  /// No description provided for @receivedSamagriNew.
  ///
  /// In en, this message translates to:
  /// **'NEW'**
  String get receivedSamagriNew;

  /// No description provided for @notificationsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No notifications yet'**
  String get notificationsEmpty;

  /// No description provided for @notificationsSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in to see your notifications'**
  String get notificationsSignIn;

  /// No description provided for @notificationsMarkAllRead.
  ///
  /// In en, this message translates to:
  /// **'Mark all read'**
  String get notificationsMarkAllRead;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'te'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'te':
      return AppLocalizationsTe();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
