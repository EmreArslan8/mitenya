import Icon from '@/components/Icon';
import ModalCard from '@/components/common/ModalCard';
import categories, { CategoryNode } from '@/lib/shop/categories';
import { MenuItem, Stack } from '@mui/material';
import { useState } from 'react';
import useStyles from './styles';

const rootNode = { key: 'categories', children: categories };

interface MobileCategoriesProps {
  open: boolean;
  onClose: () => void;
  onOptionClicked: (node: CategoryNode) => void;
}

const MobileCategories = ({ open, onClose, onOptionClicked }: MobileCategoriesProps) => {
  const styles = useStyles();
  const [history, setHistory] = useState<CategoryNode[]>([rootNode]);

  const handleHistoryPush = (node: CategoryNode) => setHistory((prev) => [...prev, node]);
  const handleHistoryPop = () => setHistory((prev) => prev.slice(0, -1));

  const handleClose = () => {
    onClose();
    setHistory([rootNode]);
  };

  const handleClick = (node: CategoryNode) => {
    if (node.children) handleHistoryPush(node);
    onOptionClicked(node);
  };

  return (
    <ModalCard
      showCloseIcon
      title={
        history[history.length - 2] ? (
          <MenuItem onClick={handleHistoryPop} sx={styles.back}>
            <Icon name="arrow_back" fontSize={20} />
            {(history[history.length - 2].key)}
          </MenuItem>
        ) : (
          <MenuItem sx={styles.back}>{t(rootNode.key)}</MenuItem>
        )
      }
      open={open}
      onClose={handleClose}
      sx={styles.modal}
      BodyProps={{ sx: styles.body }}
    >
      {history[history.length - 1].children?.map((node) => (
        <MenuItem sx={styles.node} key={node.key}>
          <Stack
            direction="row"
            gap={1}
            onClick={() => handleClick(node)}
            alignItems="center"
            sx={{ width: '100%' }}
          >
            {node.icon && <Icon color="tertiary" name={node.icon} />}
            {(node.key)}
          </Stack>
          {node.children && (
            <Icon sx={styles.icon} name="chevron_right" onClick={() => handleHistoryPush(node)} />
          )}
        </MenuItem>
      ))}
    </ModalCard>
  );
};

export default MobileCategories;
