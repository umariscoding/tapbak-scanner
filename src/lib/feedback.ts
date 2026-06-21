import * as Haptics from "expo-haptics";

/** Light tick when a QR is recognised. */
export function tick(): void {
  void Haptics.selectionAsync();
}

/** Strong success feedback after a stamp/point is added or a reward redeemed. */
export function success(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Error feedback when an action fails. */
export function error(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
