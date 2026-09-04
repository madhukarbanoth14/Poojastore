import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_controller.dart';
import 'core/i18n/locale_controller.dart';
import 'l10n/l10n.dart';
import 'features/admin/presentation/admin_bookings_screen.dart';
import 'features/admin/presentation/admin_hub_screen.dart';
import 'features/admin/presentation/admin_orders_screen.dart';
import 'features/admin/presentation/admin_users_screen.dart';
import 'features/auth/presentation/auth_controller.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/signup_screen.dart';
import 'features/home/presentation/home_screen.dart';
import 'features/marketplace/presentation/cart_screen.dart';
import 'features/marketplace/presentation/checkout_screen.dart';
import 'features/marketplace/presentation/festival_screen.dart';
import 'features/marketplace/presentation/kit_detail_screen.dart';
import 'features/marketplace/presentation/samagri_scan_screen.dart';
import 'features/marketplace/presentation/poojari_samagri_screens.dart';
import 'features/marketplace/presentation/pooja_guides_screen.dart';
import 'features/marketplace/presentation/pooja_guide_detail_screen.dart';
import 'features/marketplace/presentation/samagri_screen.dart';
import 'features/marketplace/presentation/order_confirm_screen.dart';
import 'features/marketplace/presentation/order_detail_screen.dart';
import 'features/marketplace/presentation/orders_screen.dart';
import 'features/marketplace/presentation/tracking_screen.dart';
import 'features/panchang/presentation/birth_profile_screen.dart';
import 'features/panchang/presentation/panchang_hub_screen.dart';
import 'features/vidhi/presentation/vidhi_detail_screen.dart';
import 'features/vidhi/presentation/vidhi_list_screen.dart';
import 'features/kids/presentation/kids_list_screen.dart';
import 'features/kids/presentation/kids_progress_screen.dart';
import 'features/kids/presentation/kids_quiz_screen.dart';
import 'features/kids/presentation/kids_story_screen.dart';
import 'features/priests/presentation/booking_confirm_screen.dart';
import 'features/priests/presentation/bookings_screen.dart';
import 'features/priests/presentation/booking_screen.dart';
import 'features/priests/presentation/priest_detail_screen.dart';
import 'features/priests/presentation/priests_list_screen.dart';
import 'features/priests/presentation/poojari_apply_screen.dart';
import 'features/priests/presentation/poojari_home_screen.dart';
import 'features/priests/presentation/video_call_screen.dart';
import 'features/guides/presentation/guides_hub_screen.dart';
import 'features/guides/presentation/prasad_detail_screen.dart';
import 'features/guides/presentation/vrat_detail_screen.dart';
import 'features/packages/presentation/package_bookings_screen.dart';
import 'features/packages/presentation/package_detail_screen.dart';
import 'features/packages/presentation/packages_list_screen.dart';
import 'features/profile/presentation/addresses_screen.dart';
import 'features/profile/presentation/family_screen.dart';
import 'features/profile/presentation/notifications_screen.dart';
import 'features/profile/presentation/personal_details_screen.dart';
import 'features/profile/presentation/profile_screen.dart';
import 'features/profile/presentation/support_screen.dart';
import 'features/profile/presentation/wishlist_screen.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/splash/splash_screen.dart';
import 'features/shell/app_shell.dart';
import 'core/notifications/push_notifications.dart';

final _routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier<int>(0);
  ref.listen<AuthState>(authControllerProvider, (_, __) {
    refresh.value++;
  });
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final loc = state.matchedLocation;

      // Guests may browse the store; only account/checkout flows require login.
      final isPoojariApply = loc == '/poojari/apply';
      const authRequiredExact = {
        '/checkout',
        '/cart',
        '/orders',
        '/order-confirm',
        '/tracking',
        '/bookings',
        '/packages/bookings',
        '/admin',
        '/poojari',
        '/panchang/profile',
      };
      final needsAuth =
          !isPoojariApply &&
          (authRequiredExact.contains(loc) ||
              loc.startsWith('/checkout') ||
              loc.startsWith('/orders/') ||
              loc.startsWith('/tracking') ||
              loc.startsWith('/book/') ||
              loc.startsWith('/profile/') ||
              loc.startsWith('/admin/') ||
              loc.startsWith('/poojari/') ||
              loc.startsWith('/video/') ||
              loc.startsWith('/order-confirm'));

      if (!auth.isAuthenticated && needsAuth) {
        final next = Uri.encodeComponent(loc);
        return '/login?next=$next';
      }
      if (auth.isAuthenticated && (loc == '/splash' || loc == '/onboarding')) {
        return auth.user?.isPoojari == true ? '/poojari' : '/';
      }
      // Post-login navigation is handled by LoginScreen (_finishLogin).
      if (auth.user?.isPoojari == true && loc == '/') return '/poojari';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(
        path: '/onboarding',
        builder: (_, __) => const OnboardingScreen(),
      ),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/signup', builder: (_, __) => const SignupScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(path: '/shop', builder: (_, __) => const SamagriScreen()),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/priests',
                builder: (_, __) => const PriestsListScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (_, __) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/kits',
        redirect: (context, state) => '/shop',
      ),
      GoRoute(
        path: '/kits/:slug',
        builder: (_, state) =>
            KitDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/samagri',
        builder: (_, state) => SamagriScreen(
          festival: state.uri.queryParameters['festival'],
        ),
      ),
      GoRoute(path: '/poojas', builder: (_, __) => const PoojaGuidesScreen()),
      GoRoute(
        path: '/poojas/:id',
        builder: (_, state) =>
            PoojaGuideDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/samagri/scan',
        builder: (_, __) => const SamagriScanScreen(),
      ),
      GoRoute(
        path: '/samagri/received/:id',
        builder: (_, state) => SamagriReceivedScreen(
          listId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
      GoRoute(path: '/checkout', builder: (_, __) => const CheckoutScreen()),
      GoRoute(
        path: '/order-confirm',
        builder: (_, state) => OrderConfirmScreen(
          orderId: state.uri.queryParameters['id'] ?? '',
          amount: state.uri.queryParameters['amount'] ?? '₹0',
          slot: state.uri.queryParameters['slot'] ?? 'Today, 6–8 PM',
        ),
      ),
      GoRoute(
        path: '/tracking/:id',
        builder: (_, state) =>
            TrackingScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/orders', builder: (_, __) => const OrdersScreen()),
      GoRoute(
        path: '/orders/:id',
        builder: (_, state) =>
            OrderDetailScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/festival/:id',
        builder: (_, state) =>
            FestivalScreen(festivalId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/festival', builder: (_, __) => const FestivalScreen(festivalId: 'ganesh')),
      GoRoute(
        path: '/notifications',
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(path: '/wishlist', builder: (_, __) => const WishlistScreen()),
      GoRoute(path: '/support', builder: (_, __) => const SupportScreen()),
      GoRoute(
        path: '/panchang',
        builder: (_, __) => const PanchangHubScreen(),
      ),
      GoRoute(
        path: '/panchang/profile',
        builder: (_, __) => const BirthProfileScreen(),
      ),
      GoRoute(path: '/vidhi', builder: (_, __) => const VidhiListScreen()),
      GoRoute(
        path: '/vidhi/:slug',
        builder: (_, state) =>
            VidhiDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(path: '/kids', builder: (_, __) => const KidsListScreen()),
      GoRoute(
        path: '/kids/progress',
        builder: (_, __) => const KidsProgressScreen(),
      ),
      GoRoute(
        path: '/kids/:slug',
        builder: (_, state) =>
            KidsStoryScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/kids/:slug/quiz',
        builder: (_, state) =>
            KidsQuizScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/priests/:slug',
        builder: (_, state) =>
            PriestDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/priests/:slug/book',
        builder: (_, state) => BookingScreen(
          slug: state.pathParameters['slug']!,
          mode: state.uri.queryParameters['mode'] ?? 'home',
        ),
      ),
      GoRoute(
        path: '/priests/:slug/video',
        builder: (_, state) => VideoCallScreen(
          slug: state.pathParameters['slug']!,
          name: state.uri.queryParameters['name'] ?? 'Panditji',
        ),
      ),
      GoRoute(path: '/poojari', builder: (_, __) => const PoojariHomeScreen()),
      GoRoute(
        path: '/poojari/apply',
        builder: (_, __) => const PoojariApplyScreen(),
      ),
      GoRoute(
        path: '/poojari/appointments/:id',
        builder: (_, state) => PoojariAppointmentScreen(
          id: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/poojari/appointments/:id/samagri',
        builder: (_, state) => PoojariSamagriComposeScreen(
          bookingId: state.pathParameters['id']!,
          devoteeName: state.uri.queryParameters['devotee'],
          serviceName: state.uri.queryParameters['service'],
        ),
      ),
      GoRoute(path: '/bookings', builder: (_, __) => const BookingsScreen()),
      GoRoute(
        path: '/booking-confirm',
        builder: (_, state) => BookingConfirmScreen(
          priestName: state.uri.queryParameters['name'] ?? 'Panditji',
          modeLine: state.uri.queryParameters['mode'] == 'online'
              ? 'join your online consultation'
              : 'visit your home',
          dateLabel: state.uri.queryParameters['date'] ?? 'Today',
          timeLabel: state.uri.queryParameters['time'] ?? '9–11 AM',
          bookingId: state.uri.queryParameters['id'] ?? 'PB-70542',
          ritual: state.uri.queryParameters['ritual'] ?? 'Griha Pravesh',
          fee: state.uri.queryParameters['fee'] ?? '₹0',
        ),
      ),
      GoRoute(
        path: '/profile/personal',
        builder: (_, __) => const PersonalDetailsScreen(),
      ),
      GoRoute(
        path: '/profile/addresses',
        builder: (_, __) => const AddressesScreen(),
      ),
      GoRoute(
        path: '/profile/family',
        builder: (_, __) => const FamilyMembersScreen(),
      ),
      GoRoute(path: '/guides', builder: (_, __) => const GuidesHubScreen()),
      GoRoute(
        path: '/guides/vrats/:slug',
        builder: (_, state) =>
            VratDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/guides/prasad/:slug',
        builder: (_, state) =>
            PrasadDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/packages',
        builder: (_, __) => const PackagesListScreen(),
      ),
      GoRoute(
        path: '/packages/:slug',
        builder: (_, state) =>
            PackageDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/package-bookings',
        builder: (_, __) => const PackageBookingsScreen(),
      ),
      GoRoute(path: '/admin', builder: (_, __) => const AdminHubScreen()),
      GoRoute(
        path: '/admin/users',
        builder: (_, __) => const AdminUsersScreen(),
      ),
      GoRoute(
        path: '/admin/orders',
        builder: (_, __) => const AdminOrdersScreen(),
      ),
      GoRoute(
        path: '/admin/bookings',
        builder: (_, __) => const AdminBookingsScreen(),
      ),
    ],
  );
});

class PoojaStoreApp extends ConsumerStatefulWidget {
  const PoojaStoreApp({super.key});

  @override
  ConsumerState<PoojaStoreApp> createState() => _PoojaStoreAppState();
}

class _PoojaStoreAppState extends ConsumerState<PoojaStoreApp> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      pushRouteHandler = (link) => ref.read(_routerProvider).push(link);
      await ref.read(pushNotificationServiceProvider).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (previous, next) {
      final push = ref.read(pushNotificationServiceProvider);
      if (previous?.isAuthenticated == true && !next.isAuthenticated) {
        push.unregister();
      } else if (next.isAuthenticated &&
          previous?.isAuthenticated != true) {
        push.syncTokenIfLoggedIn();
      }
    });

    final router = ref.watch(_routerProvider);
    final locale = ref.watch(localeControllerProvider);
    final themeMode = ref.watch(themeControllerProvider);

    return MaterialApp.router(
      title: 'Pavitra Seva',
      debugShowCheckedModeBanner: false,
      locale: locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      theme: buildLightTheme(locale),
      darkTheme: buildDarkTheme(locale),
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
