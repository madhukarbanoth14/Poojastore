import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../../features/profile/data/notifications_api.dart';
import '../config/app_config.dart';

typedef PushRouteHandler = void Function(String deepLink);

PushRouteHandler? pushRouteHandler;

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  if (!AppConfig.enablePushNotifications) return;
  await Firebase.initializeApp(options: AppConfig.firebaseOptions);
}

class PushNotificationService {
  PushNotificationService(this._ref);

  final Ref _ref;
  final _local = FlutterLocalNotificationsPlugin();
  String? _currentToken;
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized || !AppConfig.enablePushNotifications) return;
    final options = AppConfig.firebaseOptions;
    if (options == null) return;

    try {
      await Firebase.initializeApp(options: options);
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      const android = AndroidInitializationSettings('@mipmap/ic_launcher');
      const ios = DarwinInitializationSettings();
      await _local.initialize(
        const InitializationSettings(android: android, iOS: ios),
        onDidReceiveNotificationResponse: (response) {
          final link = response.payload;
          if (link != null && link.isNotEmpty) {
            pushRouteHandler?.call(link);
          }
        },
      );

      if (Platform.isAndroid) {
        await _local
            .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin>()
            ?.createNotificationChannel(
              const AndroidNotificationChannel(
                'pooja_store_default',
                'Pooja Store',
                description: 'Booking and samagri updates',
                importance: Importance.high,
              ),
            );
      }

      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(alert: true, badge: true, sound: true);

      FirebaseMessaging.onMessage.listen(_showForegroundNotification);
      FirebaseMessaging.onMessageOpenedApp.listen(_handleRemoteMessage);
      final initial = await messaging.getInitialMessage();
      if (initial != null) {
        _handleRemoteMessage(initial);
      }

      _currentToken = await messaging.getToken();
      messaging.onTokenRefresh.listen((token) async {
        _currentToken = token;
        await _syncToken(token);
      });

      _initialized = true;
      await syncTokenIfLoggedIn();
    } catch (error) {
      debugPrint('Push notifications unavailable: $error');
    }
  }

  Future<void> syncTokenIfLoggedIn() async {
    if (!_initialized || _currentToken == null) return;
    final auth = _ref.read(authControllerProvider);
    if (!auth.isAuthenticated) return;
    await _syncToken(_currentToken!);
  }

  Future<void> unregister() async {
    if (_currentToken == null) return;
    try {
      await _ref.read(notificationsApiProvider).removePushToken(_currentToken!);
    } catch (_) {}
  }

  Future<void> _syncToken(String token) async {
    try {
      final platform = Platform.isIOS
          ? 'IOS'
          : Platform.isAndroid
              ? 'ANDROID'
              : 'WEB';
      await _ref.read(notificationsApiProvider).registerPushToken(
            token: token,
            platform: platform,
          );
    } catch (error) {
      debugPrint('Push token registration failed: $error');
    }
  }

  void _handleRemoteMessage(RemoteMessage message) {
    final link = message.data['deepLink'] as String?;
    if (link != null && link.isNotEmpty) {
      pushRouteHandler?.call(link);
    }
  }

  Future<void> _showForegroundNotification(RemoteMessage message) async {
    final notification = message.notification;
    final title = notification?.title ?? message.data['title'] ?? 'Pooja Store';
    final body = notification?.body ?? message.data['body'] ?? '';
    final deepLink = message.data['deepLink'] as String? ?? '';

    await _local.show(
      message.hashCode,
      title,
      body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'pooja_store_default',
          'Pooja Store',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
      payload: deepLink,
    );
  }
}

final notificationsApiProvider = Provider(
  (ref) => NotificationsApi(ref.watch(apiClientProvider)),
);

final pushNotificationServiceProvider = Provider((ref) {
  final service = PushNotificationService(ref);
  ref.onDispose(() {});
  return service;
});
