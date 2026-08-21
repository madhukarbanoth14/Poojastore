// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Telugu (`te`).
class AppLocalizationsTe extends AppLocalizations {
  AppLocalizationsTe([String locale = 'te']) : super(locale);

  @override
  String get appTitle => 'పూజా స్టోర్';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageTelugu => 'తెలుగు';

  @override
  String get cart => 'కార్ట్';

  @override
  String get adminOps => 'అడ్మిన్';

  @override
  String get logout => 'లాగ్ అవుట్';

  @override
  String get namaste => 'నమస్తే';

  @override
  String namasteName(String name) {
    return 'నమస్తే, $name';
  }

  @override
  String get homePanchangTitle => 'పంచాంగం & రాశి';

  @override
  String get homePanchangSubtitle => 'ఈరోజు తిథి, ముహూర్తాలు, రాశి సూచనలు';

  @override
  String get homeVidhiTitle => 'పూజా విధి';

  @override
  String get homeVidhiSubtitle => 'దశలవారీ విధి, మంత్రాలు, కథ';

  @override
  String get homeKidsTitle => 'పిల్లల విభాగం';

  @override
  String get homeKidsSubtitle => 'పండుగ కథలు, సరదా క్విజ్‌లు';

  @override
  String get homePriestsTitle => 'పండితుని బుక్ చేయండి';

  @override
  String get homePriestsSubtitle =>
      'పండితులను ఎంచుకుని, స్లాట్ తీసుకుని, యాప్‌లో చెల్లించండి';

  @override
  String get homeGuidesTitle => 'ప్రసాదం & వ్రతం';

  @override
  String get homeGuidesSubtitle => 'ఉపవాస నియమాలు, వంటకాలు, ఆర్డర్ ప్రసాదం';

  @override
  String get homePackagesTitle => 'పూజా ప్యాకేజీలు';

  @override
  String get homePackagesSubtitle =>
      'కిట్ + పండితుడు + ప్రసాదం — ఒకే చెల్లింపు';

  @override
  String get homeKitsTitle => 'పూజా కిట్‌లు';

  @override
  String get homeKitsSubtitle => 'పండుగ, సందర్భ కిట్‌లు యాప్‌లో కొనండి';

  @override
  String get homeSamagriTitle => 'పూజా సామగ్రి';

  @override
  String get homeSamagriSubtitle =>
      'రోజువారీ వస్తువులు, గణేష్ హోమం, వరలక్ష్మీ కిట్‌లు';

  @override
  String get homeOrdersTitle => 'నా ఆర్డర్లు';

  @override
  String get homeOrdersSubtitle => 'కిట్‌లు, బుకింగ్‌లు ట్రాక్ చేయండి';

  @override
  String get homeComingNext => 'తర్వాత: పూర్తి వెండర్ మార్కెట్‌ప్లేస్.';

  @override
  String get loginSubtitle => 'మీ మొబైల్ నంబర్‌తో సైన్ ఇన్ అవ్వండి';

  @override
  String get loginOtpSubtitle => 'ఫోన్‌కు వచ్చిన OTP నమోదు చేయండి';

  @override
  String get country => 'దేశం';

  @override
  String get countryIndia => 'భారతదేశం (+91)';

  @override
  String get countryUsCa => 'USA / కెనడా (+1)';

  @override
  String get mobileNumber => 'మొబైల్ నంబర్';

  @override
  String get fullNameOptional => 'పూర్తి పేరు (ఐచ్ఛికం)';

  @override
  String get sendOtp => 'OTP పంపండి';

  @override
  String get otp => 'OTP';

  @override
  String devOtp(String code) {
    return 'డెవ్ OTP: $code';
  }

  @override
  String get verifyContinue => 'ధృవీకరించి కొనసాగండి';

  @override
  String get changeNumber => 'నంబర్ మార్చండి';

  @override
  String get kitsTitle => 'పూజా కిట్‌లు';

  @override
  String get samagriTitle => 'పూజా సామగ్రి';

  @override
  String get samagriKitsSection => 'పూర్తి కిట్‌లు';

  @override
  String get samagriItemsSection => 'విడి వస్తువులు';

  @override
  String get samagriDetails => 'సామగ్రి వివరాలు';

  @override
  String get packDetails => 'ప్యాక్ వివరాలు';

  @override
  String get optionalItem => 'ఐచ్ఛికం';

  @override
  String get noSamagri => 'సామగ్రి ఇంకా జాబితాలో లేదు';

  @override
  String get kitDetails => 'కిట్ వివరాలు';

  @override
  String get includedItems => 'ఉన్న వస్తువులు';

  @override
  String qty(int count) {
    return 'సంఖ్య: $count';
  }

  @override
  String get addToCart => 'కార్ట్‌లో చేర్చండి';

  @override
  String get addedToCart => 'కార్ట్‌లో చేరింది';

  @override
  String get emptyCart => 'కార్ట్ ఖాళీగా ఉంది';

  @override
  String get browseKits => 'కిట్‌లు చూడండి';

  @override
  String get proceedToCheckout => 'చెక్అవుట్‌కు వెళ్లండి';

  @override
  String get checkout => 'చెక్అవుట్';

  @override
  String get selectAddress => 'డెలివరీ చిరునామా ఎంచుకోండి';

  @override
  String get payNow => 'ఇప్పుడు చెల్లించండి';

  @override
  String get processing => 'ప్రాసెస్ అవుతోంది…';

  @override
  String get paymentSuccessMock => 'చెల్లింపు విజయవంతం (మాక్)';

  @override
  String get paymentRedirect =>
      'గేట్‌వేలో చెల్లింపు పూర్తి చేసి తిరిగి రండి. వెబ్‌హుక్ ఆర్డర్‌ను నిర్ధారిస్తుంది.';

  @override
  String get myOrders => 'నా ఆర్డర్లు';

  @override
  String get noOrdersYet => 'ఇంకా ఆర్డర్లు లేవు';

  @override
  String get vidhiTitle => 'పూజా విధి';

  @override
  String get categoryAll => 'అన్నీ';

  @override
  String get categoryOccasion => 'సందర్భం';

  @override
  String get categoryFestival => 'పండుగ';

  @override
  String get categoryDaily => 'నిత్యం';

  @override
  String get categoryVrat => 'వ్రతం';

  @override
  String get noVidhis => 'విధులు ఇంకా ప్రచురించలేదు';

  @override
  String vidhiMeta(int minutes, String difficulty, int steps) {
    return '$minutes ని · $difficulty · $steps దశలు';
  }

  @override
  String get katha => 'కథ';

  @override
  String get getRelatedKit => 'సంబంధిత పూజా కిట్';

  @override
  String startSteps(int count) {
    return '$count దశలు ప్రారంభించండి';
  }

  @override
  String get noSteps => 'దశలు లేవు';

  @override
  String get transliteration => 'ఉచ్ఛారణ';

  @override
  String get meaning => 'అర్థం';

  @override
  String get previous => 'మునుపటి';

  @override
  String get next => 'తర్వాత';

  @override
  String get done => 'పూర్తి';

  @override
  String get bestTime => 'శుభ సమయం';

  @override
  String get duration => 'సమయం';

  @override
  String get difficulty => 'స్థాయి';

  @override
  String get kidsTitle => 'పిల్లల విభాగం';

  @override
  String get myProgress => 'నా పురోగతి';

  @override
  String get noStories => 'కథలు లేవు';

  @override
  String get kidsProgressTitle => 'పిల్లల పురోగతి';

  @override
  String get kidsProgressEmpty =>
      'కథ లేదా క్విజ్ పూర్తి చేస్తే ఇక్కడ కనిపిస్తుంది.';

  @override
  String get storyCompleted => 'కథ పూర్తయింది — అద్భుతం!';

  @override
  String get back => 'వెనక్కి';

  @override
  String get takeQuiz => 'క్విజ్ రాయండి';

  @override
  String get markComplete => 'కథ పూర్తయిందిగా గుర్తించండి';

  @override
  String get whyCelebrated => 'ఎందుకు జరుపుకుంటాం';

  @override
  String get importance => 'ఎందుకు ముఖ్యం';

  @override
  String get answerEveryQuestion => 'ప్రతి ప్రశ్నకు సమాధానం ఇవ్వండి';

  @override
  String get quizResult => 'క్విజ్ ఫలితం';

  @override
  String get quizWellDone => 'చాలా బాగుంది!';

  @override
  String get quizRetry => 'మళ్లీ చదివి ప్రయత్నించండి';

  @override
  String quizScore(int score, int total, int passScore) {
    return 'స్కోరు: $score / $total (పాస్ $passScore)';
  }

  @override
  String get backToKids => 'పిల్లల విభాగానికి';

  @override
  String get checking => 'తనిఖీ…';

  @override
  String get submitAnswers => 'సమాధానాలు పంపండి';

  @override
  String get ageLittle => 'చిన్నారి';

  @override
  String get ageJunior => 'జూనియర్';

  @override
  String get ageTeen => 'టీన్';

  @override
  String get bookPriest => 'పండితుని బుక్ చేయండి';

  @override
  String get myBookings => 'నా బుకింగ్‌లు';

  @override
  String yearsExp(int years) {
    return '$years సం.';
  }

  @override
  String languagesLabel(String list) {
    return 'భాషలు: $list';
  }

  @override
  String get noOpenSlots => 'ఇప్పుడు స్లాట్‌లు లేవు';

  @override
  String get booking => 'బుక్ అవుతోంది…';

  @override
  String get bookAndPay => 'బుక్ చేసి చెల్లించండి';

  @override
  String get cancelBookingTitle => 'బుకింగ్ రద్దు చేయాలా?';

  @override
  String get cancelBookingBody =>
      'స్లాట్ ఖాళీ అవుతుంది. చెల్లించిన బుకింగ్‌కు అడ్మిన్ రీఫండ్ కావాలి.';

  @override
  String get keep => 'ఉంచండి';

  @override
  String get cancelBooking => 'బుకింగ్ రద్దు';

  @override
  String get bookingCancelled => 'బుకింగ్ రద్దయింది';

  @override
  String get myPriestBookings => 'నా పండిత బుకింగ్‌లు';

  @override
  String get noBookingsYet => 'ఇంకా బుకింగ్‌లు లేవు';

  @override
  String get cancel => 'రద్దు';

  @override
  String get guidesTitle => 'ప్రసాదం & వ్రతం';

  @override
  String get tabVrat => 'వ్రతం';

  @override
  String get tabPrasad => 'ప్రసాదం';

  @override
  String get upcoming => 'రాబోయేవి';

  @override
  String get noUpcoming => 'రాబోయే తేదీలు లేవు';

  @override
  String get allVrats => 'అన్ని వ్రతాలు';

  @override
  String get orderable => 'ఆర్డర్ చేయవచ్చు';

  @override
  String minServings(int minutes, int servings) {
    return '$minutes ని · $servings సర్వింగ్‌లు';
  }

  @override
  String get packagesTitle => 'పూజా ప్యాకేజీలు';

  @override
  String get packageBooked => 'ప్యాకేజీ బుక్ అయింది';

  @override
  String get pujaKit => 'పూజా కిట్';

  @override
  String get priestVisit => 'పండితుల సందర్శన';

  @override
  String get addOns => 'అదనపు సేవలు';

  @override
  String get bookPackagePay => 'ప్యాకేజీ బుక్ చేసి చెల్లించండి';

  @override
  String get myPackageBookings => 'నా ప్యాకేజీ బుకింగ్‌లు';

  @override
  String get noPackageBookings => 'ప్యాకేజీ బుకింగ్‌లు లేవు';

  @override
  String get cancelPackageTitle => 'ప్యాకేజీ రద్దు చేయాలా?';

  @override
  String get cancelPackageBody =>
      'పండిత స్లాట్ ఖాళీ అవుతుంది. చెల్లింపు అయితే అడ్మిన్ రీఫండ్ చూస్తారు.';

  @override
  String get cancelPackage => 'ప్యాకేజీ రద్దు';

  @override
  String get packageCancelled => 'ప్యాకేజీ బుకింగ్ రద్దయింది';

  @override
  String get panchangTitle => 'పంచాంగం & రాశి';

  @override
  String get birthProfile => 'జనన వివరాలు';

  @override
  String get tabToday => 'ఈరోజు';

  @override
  String get tabGuidance => 'సూచన';

  @override
  String get tabCalendar => 'క్యాలెండర్';

  @override
  String get festivals => 'పండుగలు';

  @override
  String get setBirthProfile => 'జనన వివరాలు పెట్టండి';

  @override
  String get birthProfileSaved => 'జనన వివరాలు సేవ్ అయ్యాయి';

  @override
  String get saving => 'సేవ్ అవుతోంది…';

  @override
  String get saveProfile => 'ప్రొఫైల్ సేవ్ చేయండి';

  @override
  String get adminUsers => 'వినియోగదారులు';

  @override
  String get adminUsersSubtitle => 'ఖాతాలు నిలిపివేయండి / యాక్టివ్ చేయండి';

  @override
  String get adminOrders => 'ఆర్డర్లు';

  @override
  String get adminOrdersSubtitle => 'ఇటీవలి కామర్స్ ఆర్డర్లు';

  @override
  String get adminBookings => 'పండిత బుకింగ్‌లు';

  @override
  String get adminBookingsSubtitle => 'పండిత బుకింగ్‌ల జాబితా';

  @override
  String get adminOrdersTitle => 'అడ్మిన్ ఆర్డర్లు';

  @override
  String get adminBookingsTitle => 'అడ్మిన్ పండిత బుకింగ్‌లు';

  @override
  String get refresh => 'రిఫ్రెష్';
}
