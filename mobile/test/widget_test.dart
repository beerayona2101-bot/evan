import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('Aneera Silks Mobile App initialization and Splash Screen smoke test', (WidgetTester tester) async {
    // Build our luxury e-commerce app
    await tester.pumpWidget(const AneeraSilksApp());
    await tester.pump();

    // Verify that the brand title is displayed on the Splash Screen
    expect(find.text('ANEERA SILKS'), findsOneWidget);
    expect(find.text('EVAN SAREE ATELIER • HYDERABAD'), findsOneWidget);
  });
}
