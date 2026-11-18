import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../widgets/luxury_button.dart';
import '../widgets/luxury_text_field.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  bool _submitted = false;
  String? _successMessage;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleReset() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final result = await auth.forgotPassword(_emailController.text.trim());

    if (!mounted) return;

    setState(() {
      _submitted = true;
      _successMessage = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.pearlWhite,
      appBar: AppBar(
        title: const Text(
          'ACCOUNT RECOVERY',
          style: TextStyle(
            fontFamily: 'serif',
            fontSize: 14,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
            color: AppColors.textCharcoal,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
          child: _submitted
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: const BoxDecoration(
                        color: AppColors.emeraldGreen,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check, size: 40, color: Colors.white),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Instructions Sent',
                      style: TextStyle(
                        fontFamily: 'serif',
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textCharcoal,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _successMessage ?? 'We have emailed your secure reset link. Please check your inbox.',
                      style: const TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      child: LuxuryButton(
                        text: 'RETURN TO SIGN IN',
                        onPressed: () => Navigator.pop(context),
                      ),
                    ),
                  ],
                )
              : Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Lock Icon Header
                      Center(
                        child: Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: AppColors.creamBg,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.primaryGold),
                          ),
                          child: const Icon(Icons.lock_reset, size: 30, color: AppColors.primaryBurgundy),
                        ),
                      ),
                      const SizedBox(height: 20),

                      const Text(
                        'Forgot Your Password?',
                        style: TextStyle(
                          fontFamily: 'serif',
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textCharcoal,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),

                      const Text(
                        'Enter your registered email address and we will dispatch a secure link to reset your credentials.',
                        style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),

                      // Email Field
                      LuxuryTextField(
                        controller: _emailController,
                        label: 'Registered Email',
                        hint: 'ananya@example.com',
                        prefixIcon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        validator: (val) {
                          if (val == null || !val.contains('@') || !val.contains('.')) {
                            return 'Please enter a valid email address.';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 24),

                      // Submit Button
                      LuxuryButton(
                        text: 'SEND RESET LINK',
                        isLoading: auth.isLoading,
                        onPressed: _handleReset,
                      ),
                      const SizedBox(height: 16),

                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text(
                          'Cancel & Return to Sign In',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted),
                        ),
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
