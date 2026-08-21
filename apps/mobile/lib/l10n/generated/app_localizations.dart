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
  /// **'Pooja Store'**
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
  /// **'Everyday items, Ganesh homam, and Varalakshmi kits'**
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
  /// **'Sign in with your mobile number'**
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
