import { ToggleButton, ToggleButtonProps } from '@mui/material';
import Icon from '../../Icon';

interface CheckButtonProps extends ToggleButtonProps {
  noIcon?: boolean;
}

const CheckButton = ({ children, noIcon = false, ...buttonProps }: CheckButtonProps) => {
  return (
    <ToggleButton
      {...buttonProps}
      color="primary"
      sx={{ ...buttonProps.sx, gap: 0.5, minWidth: 44, flexShrink: 0 }}
    >
      {!noIcon && buttonProps.selected && (
        <Icon name="check" fontSize={buttonProps.size === 'small' ? 22 : 24} />
      )}
      {children}
    </ToggleButton>
  );
};

export default CheckButton;
