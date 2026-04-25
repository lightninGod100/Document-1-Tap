// app/(tabs)/settings.tsx

// MODIFIED: Phase 11C - Clear All Data implementation
// - Added 3-step confirmation dialog flow
// - Added biometric re-authentication via authenticateForShare()
// - Added Snackbar for success/error feedback

import React, { useState } from 'react'; // MODIFIED: Added React + useState
import { ScrollView, StyleSheet, View, Share } from 'react-native';
import {
  Appbar,
  Button,
  Dialog,
  Divider,
  List,
  Portal,
  Snackbar,
  Text,
  useTheme, // ADDED: For theme-aware error color
} from 'react-native-paper'; // MODIFIED: Added Button, Dialog, Portal, Snackbar, Text, useTheme

// ADDED: Imports for clear-all functionality
import { authenticateForShare } from '../../src/utils/auth';
import { clearAllAppData } from '../../src/utils/clearData';
import { useDocuments } from '../../src/contexts/DocumentContext';
import { useCategories } from '../../src/contexts/CategoryContext';
// ADDED: For navigation to change-pin screen
import { useRouter } from 'expo-router';

// ADDED: Constants for "Share App" feature
// TODO: Update SHARE_APP_URL with the real Play Store URL before release.
// Format: https://play.google.com/store/apps/details?id=<your.package.name>
const SHARE_APP_URL = 'https://play.google.com/store/apps/details?id=com.doc1tap';
const SHARE_APP_MESSAGE = `Check out Document 1 Tap — a secure offline vault for your important documents. Download: ${SHARE_APP_URL}`;

export default function SettingsScreen() {
  const theme = useTheme(); // ADDED
  const router = useRouter(); // ADDED: For navigation to change-pin screen
  // ADDED: Context reload methods (for refreshing UI after clear)
  const { reloadDocuments } = useDocuments();
  const { reloadCategories } = useCategories();

  // ADDED: Dialog state machine
  // null = no dialog showing | 'warning' | 'final' = which dialog is visible
  const [activeDialog, setActiveDialog] = useState<'warning' | 'final' | null>(null);

  // ADDED: Prevents double-taps during async ops
  const [isProcessing, setIsProcessing] = useState(false);

  // ADDED: Snackbar state for success/error feedback
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    isError: boolean;
  }>({ visible: false, message: '', isError: false });

  // ADDED: Step 1 - User taps "Clear All Data" row
  const handleClearAllPressed = () => {
    setActiveDialog('warning');
  };

  // ADDED: Step 2 - User confirms warning, trigger biometric auth
  const handleWarningContinue = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setActiveDialog(null); // Close warning dialog before showing OS prompt

      const result = await authenticateForShare();

      if (result.success) {
        // Biometric passed → show final confirmation
        setActiveDialog('final');
      } else {
        // User cancelled biometric or it failed - abort silently
        // (OS already showed any relevant error)
      }
    } catch (err) {
      console.error('Biometric auth error during clear-all:', err);
      setSnackbar({
        visible: true,
        message: 'Authentication failed. Please try again.',
        isError: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ADDED: Step 3 - User confirms final dialog, execute clear
  const handleFinalConfirm = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      const result = await clearAllAppData();

      if (!result.success) {
        throw new Error(result.error ?? 'Clear data failed');
      }

      // Reload contexts so UI reflects empty state on other tabs
      await Promise.all([reloadDocuments(), reloadCategories()]);

      setActiveDialog(null);
      setSnackbar({
        visible: true,
        message: 'All data cleared successfully',
        isError: false,
      });
    } catch (err) {
      console.error('Clear all data failed:', err);
      setActiveDialog(null);
      setSnackbar({
        visible: true,
        message: 'Failed to clear data. Please try again.',
        isError: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ADDED: Cancel handler - resets dialog state
  const handleCancel = () => {
    if (isProcessing) return;
    setActiveDialog(null);
  };

  // ADDED: Share App handler — opens native share sheet with app message + Play Store URL.
// Mirrors the snackbar/try-catch pattern used by handleFinalConfirm for consistency.
const handleShareApp = async () => {
  try {
    const result = await Share.share({
      message: SHARE_APP_MESSAGE,
      // 'url' is iOS-only and shown in addition to message; Android uses message only.
      // Including it keeps the link clickable on iOS share targets that support it.
      url: SHARE_APP_URL,
      title: 'Share Document 1 Tap', // Android: dialog chooser title
    });

    // result.action === 'dismissedAction' means user cancelled — stay silent, no snackbar.
    // result.action === 'sharedAction' means user picked a target — also stay silent
    // (the target app handles its own confirmation/feedback).
    // We only show feedback on actual errors below.
    if (result.action === Share.sharedAction) {
      // Optional: could show success snackbar, but most apps don't — feels noisy.
      // Leaving silent to match platform conventions.
    }
  } catch (err) {
    console.error('Share App failed:', err);
    setSnackbar({
      visible: true,
      message: 'Failed to open share sheet. Please try again.',
      isError: true,
    });
  }
};

  return (
    <View style={styles.container}>
      {/* App Header */}
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      {/* Settings List */}
{/* MODIFIED: Expanded settings list - wrapped in ScrollView for overflow */}
<ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <List.Section>
          {/* ===== Appearance ===== */}
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Theme"
            description="System" // MODIFIED: Was "Light" - placeholder until theme switcher wired
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}} // No-op: UI only
          />

          <Divider />

          {/* ADDED: Security section */}
          <List.Subheader>Security</List.Subheader>
          <List.Item
            title="Change PIN"
            description="Update your 4-digit PIN"
            left={(props) => <List.Icon {...props} icon="lock-reset" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/auth/change-pin')} // No-op: UI only
          />

          <Divider />

          {/* ===== Data (existing - kept wired) ===== */}
          <List.Subheader>Data</List.Subheader>
          <List.Item
            title="Clear All Data"
            description="Delete all documents and categories"
            left={(props) => (
              <List.Icon {...props} icon="delete-outline" color={theme.colors.error} />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleClearAllPressed} // Existing wired handler
          />

          <Divider />

          {/* ADDED: Share section */}
          <List.Subheader>Share</List.Subheader>
          <List.Item
            title="Share App"
            description="Tell others about Document 1 Tap"
            left={(props) => <List.Icon {...props} icon="share-variant-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleShareApp}
          />
          <List.Item
            title="Rate App"
            description="Rate us on the Play Store"
            left={(props) => <List.Icon {...props} icon="star-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}} // No-op: UI only
          />

          <Divider />

          {/* ADDED: Support section */}
          <List.Subheader>Support</List.Subheader>
          <List.Item
            title="FAQs"
            description="Frequently asked questions"
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}} // No-op: UI only
          />
          <List.Item
            title="Reach Us"
            description="Get in touch with our team"
            left={(props) => <List.Icon {...props} icon="email-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}} // No-op: UI only
          />

          <Divider />

          {/* ADDED: Legal section */}
          <List.Subheader>Legal</List.Subheader>
          <List.Item
            title="Privacy Policy"
            description="How we handle your data"
            left={(props) => <List.Icon {...props} icon="shield-lock-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}} // No-op: UI only
          />
          <List.Item
            title="Terms of Service"
            description="Terms and conditions"
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}} // No-op: UI only
          />

          <Divider />

          {/* MODIFIED: About section - now tappable row instead of inline version */}
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="About"
            description="Version 1.0.0"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}} // No-op: UI only
          />
        </List.Section>
      </ScrollView>

      {/* ADDED: Dialog 1 - Warning */}
      <Portal>
        <Dialog
          visible={activeDialog === 'warning'}
          onDismiss={handleCancel}
          dismissable={!isProcessing}
        >
          <Dialog.Icon icon="alert-outline" color={theme.colors.error} />
          <Dialog.Title style={styles.dialogTitle}>Clear All Data?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will delete all documents and categories from this device.
            </Text>
            <Text variant="bodyMedium" style={styles.dialogSpacer}>
              Your PIN and app preferences will be preserved.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onPress={handleWarningContinue}
              disabled={isProcessing}
              loading={isProcessing}
            >
              Continue
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* ADDED: Dialog 3 - Final confirmation (Dialog 2 is the OS biometric prompt) */}
        <Dialog
          visible={activeDialog === 'final'}
          onDismiss={handleCancel}
          dismissable={!isProcessing}
        >
          <Dialog.Icon icon="alert-octagon" color={theme.colors.error} />
          <Dialog.Title style={styles.dialogTitle}>Are you absolutely sure?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              All your documents and custom categories will be permanently deleted.
              This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onPress={handleFinalConfirm}
              disabled={isProcessing}
              loading={isProcessing}
              textColor={theme.colors.error}
            >
              Yes, Delete Everything
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ADDED: Snackbar for success/error feedback */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{
          backgroundColor: snackbar.isError
            ? theme.colors.errorContainer
            : theme.colors.inverseSurface,
        }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ADDED: ScrollView styles for expanded settings list
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24, // Breathing room above tab bar
  },
  // ADDED: Dialog styles
  dialogTitle: {
    textAlign: 'center',
  },
  dialogSpacer: {
    marginTop: 12,
  },
});