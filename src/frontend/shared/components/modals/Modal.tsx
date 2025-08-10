import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { colors, borderRadius, spacing, zIndex } from '../../styles/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ModalProps {
  /**
   * Trạng thái hiển thị của modal
   */
  visible: boolean;
  /**
   * Sự kiện khi đóng modal
   */
  onClose: () => void;
  /**
   * Nội dung bên trong modal
   */
  children: React.ReactNode;
  /**
   * Cho phép đóng modal khi nhấn ra ngoài
   * @default true
   */
  closeOnBackdropPress?: boolean;
  /**
   * Vị trí hiển thị modal (center, bottom)
   * @default 'center'
   */
  position?: 'center' | 'bottom';
  /**
   * Style tùy chỉnh cho container
   */
  containerStyle?: ViewStyle;
  /**
   * Hiển thị backdrop mờ phía sau
   * @default true
   */
  showBackdrop?: boolean;
  /**
   * Độ trong suốt của backdrop
   * @default 0.5
   */
  backdropOpacity?: number;
  /**
   * Thuộc tính testID cho testing
   */
  testID?: string;
}

/**
 * Component Modal dùng chung cho toàn bộ ứng dụng
 * 
 * @example
 * ```jsx
 * const [visible, setVisible] = useState(false);
 * 
 * <Button onPress={() => setVisible(true)}>Mở Modal</Button>
 * 
 * <Modal visible={visible} onClose={() => setVisible(false)}>
 *   <View style={{ padding: 20 }}>
 *     <Typography.Heading>Thông báo</Typography.Heading>
 *     <Typography.Body>Nội dung thông báo</Typography.Body>
 *     <Button onPress={() => setVisible(false)}>Đóng</Button>
 *   </View>
 * </Modal>
 * ```
 */
const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  closeOnBackdropPress = true,
  position = 'center',
  containerStyle,
  showBackdrop = true,
  backdropOpacity = 0.5,
  testID,
}) => {
  // Xác định style dựa trên position
  const getPositionStyle = () => {
    switch (position) {
      case 'bottom':
        return styles.bottomContainer;
      case 'center':
      default:
        return styles.centerContainer;
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback
          onPress={closeOnBackdropPress ? onClose : undefined}
          testID={`${testID}-backdrop`}
        >
          <View
            style={[
              styles.backdrop,
              showBackdrop && { backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` },
            ]}
          >
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.baseContainer,
                  getPositionStyle(),
                  containerStyle,
                ]}
              >
                {children}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: zIndex.overlay,
  },
  baseContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    zIndex: zIndex.modal,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerContainer: {
    width: '85%',
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : 0,
  },
});

export default Modal;