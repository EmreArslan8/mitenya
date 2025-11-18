import { AddressData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { LoadingButton } from '@mui/lab';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Fade,
  Grid,
  IconButton,
  Menu,
  Skeleton,
  Stack,
  Theme,
  SxProps,
  Typography,
} from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import Icon from '../Icon';
import Card from '../common/Card';
import EditAddressModal from './modals/EditAddressModal';
import styles from './styles';
import useAddress from '@/lib/api/useAddress';

const gridColumns = {
  contactName: { xs: 6 },
  taxNumber: { xs: 6 },
  contactPhone: { xs: 6, sm: 12 },
  lines: { xs: 12 },
  postcode: { xs: 6 },
  city: { xs: 6 },
  district: { xs: 6 },
  state: { xs: 6 },
  countryCode: { xs: 6 },
};

interface AddressCardProps {
  data?: AddressData;
  onChange?: (address: AddressData) => void;
  children?: ReactNode;
  hideEdit?: boolean;
  hideDelete?: boolean;
  active?: boolean;
  skeleton?: boolean;
  summarized?: boolean;
}

type GridColumn = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
};

const AddressCard = ({
  data: _data,
  onChange = () => {},
  hideEdit,
  hideDelete,
  children,
  active,
  summarized = false,
  skeleton = false,
}: AddressCardProps) => {
  const { deleteAddress } = useAddress();
  const [deleteMenuAnchor, setDeleteMenuAnchor] = useState<HTMLElement | null>(null);
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { smDown, smUp } = useScreen();

  useEffect(() => {
    setDeleteMenuOpen(Boolean(deleteMenuAnchor));
  }, [deleteMenuAnchor]);

  useEffect(() => {
    if (smUp && !summarized) setExpanded(true);
    else setExpanded(false);
  }, [smUp, summarized]);

  if (!_data || skeleton) return <AddressSkeleton>{children}</AddressSkeleton>;

  const {
    id,
    name,
    contactName,
    taxNumber,
    countryCode,
    phoneCode,
    phoneNumber,
    email,
    line1,
    line2,
    line3,
    postcode,
    ...rest
  } = _data;

  const data = {
    email,
    lines: summarized
      ? [line1, line2, line3, ...Object.values(rest), postcode, (`countries.${countryCode}`)]
          .filter((e) => e)
          .join(', ')
      : [line1, line2, line3].filter((e) => e).join(', '),
    postcode,
    ...rest,
  };

  const handleDeleteButtonClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setDeleteMenuAnchor(event.currentTarget);

  const handleDeleteMenuClose = () => {
    setDeleteMenuOpen(false);
    setDeleteMenuAnchor(null);
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    deleteAddress(id.toString()).then((result) => {
      setDeleteLoading(false);
      if (!result) return;
      handleDeleteMenuClose();
      setTimeout(onChange, 200);
    });
  };

  return (
    <>
      <Card
        iconName="distance"
        border
        title={
          <Stack sx={styles.cardHeader}>
            <Typography variant="cardTitle">{name ?? ('address.defaultCardLabel')}</Typography>
            <Stack direction="row" alignItems="center">
              {!hideEdit && (
                <IconButton onClick={() => setEditModalOpen(true)} sx={{ my: -1 }}>
                  <Icon name="edit" fontSize={22} />
                </IconButton>
              )}
              {!hideDelete && (
                <IconButton onClick={handleDeleteButtonClick} sx={{ my: -1 }}>
                  <Icon name="delete" color="error" fontSize={22} />
                </IconButton>
              )}
            </Stack>
          </Stack>
        }
        sx={{ ...styles.card, ...(active ? styles.cardActive : {}) }}
      >
        <Stack sx={styles.cardBody}>
          <Grid container columnSpacing={{ xs: 2, md: 6 }} rowSpacing={1.5}>
            <AddressInfoItem
              cols={gridColumns.contactName}
              label={('address.contactName')}
              value={contactName}
            />
            {taxNumber && !summarized && (
              <AddressInfoItem
                cols={gridColumns.taxNumber}
                label={('address.taxNumber')}
                value={taxNumber}
              />
            )}
            <AddressInfoItem
              cols={gridColumns.lines}
              label={('address.lines')}
              value={data.lines}
              sx={{
                height: expanded ? 0 : 'fit-content',
                my: expanded ? -1.5 : 0,
                overflow: 'hidden',
              }}
            />
          </Grid>
          {!summarized && (
            <Accordion
              disableGutters
              expanded={expanded}
              onChange={() => setExpanded((prev) => !prev)}
              elevation={0}
              sx={styles.accordion}
            >
              <AccordionSummary
                sx={{
                  ...styles.accordionSummary,
                  height: 0,
                  my: expanded ? 0 : 2,
                  pointerEvents: expanded ? 'none' : 'initial',
                }}
              >
                <Fade in={smDown && !expanded} timeout={200}>
                  <Button
                    size="small"
                    endIcon={
                      <Icon
                        name="expand_more"
                        color="primary"
                        sx={{ rotate: expanded ? '180deg' : '0deg', transition: 'rotate 0.2s' }}
                      />
                    }
                  >
                    {('address.viewMore')}
                  </Button>
                </Fade>
              </AccordionSummary>
              <AccordionDetails sx={{ ...styles.accordionDetails, mt: -0.5 }}>
                <Grid container columnSpacing={{ xs: 2, md: 6 }} rowSpacing={1.5}>
                  {(phoneNumber || phoneCode) && (
                    <AddressInfoItem
                      cols={gridColumns.contactPhone}
                      label={('address.phoneNumber')}
                      value={`${phoneCode ?? ''}${phoneNumber ?? ''}`}
                    />
                  )}

                  {data &&
                    Object.entries(data).map(
                      ([key, value]) =>
                        value && (
                          <AddressInfoItem
                            cols={gridColumns[key as keyof typeof gridColumns]}
                            label={(`address.${key}`)}
                            value={value}
                            key={key + value}
                          />
                        )
                    )}
                  <AddressInfoItem
                    cols={gridColumns.countryCode}
                    label={('address.countryCode')}
                    value={(`regions.${countryCode.toLowerCase()}`)}
                    key={'countryCode' + countryCode}
                  />
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
          {children}
        </Stack>
      </Card>
      <Menu
        elevation={0}
        open={deleteMenuOpen}
        anchorEl={deleteMenuAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{ sx: { boxShadow: '0px 0px 16px 0px #00000040' } }}
        MenuListProps={{ sx: { p: 0 } }}
      >
        <Card title={('address.deleteTitle')} sx={{ width: 200 }}>
          <Stack p={2} gap={1.5}>
            <Button
              color="secondary"
              variant="outlined"
              size="small"
              onClick={handleDeleteMenuClose}
            >
              {('address.deleteCancel')}
            </Button>
            <LoadingButton
              loading={deleteLoading}
              color="error"
              variant="contained"
              size="small"
              onClick={handleDelete}
            >
              {('address.deleteConfirm')}
            </LoadingButton>
          </Stack>
        </Card>
      </Menu>
      <EditAddressModal
        initialData={_data}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdited={onChange}
      />
    </>
  );
};

const AddressInfoItem = ({
  label,
  value,
  cols,
  sx,
}: {
  label: ReactNode;
  value: ReactNode;
  cols: GridColumn;
  sx?: SxProps<Theme>;
}) => {
  return (
    <Grid item {...cols} sx={sx}>
      <Stack sx={styles.item}>
        <Typography variant="infoLabel">{label}</Typography>
        <Typography variant="infoValue">{value}</Typography>
      </Stack>
    </Grid>
  );
};

const AddressSkeleton = ({ children }: { children: ReactNode }) => {
  return (
  <Card
    iconName="distance"
      title={
        <Typography variant="cardTitle">{('address.defaultCardLabel')}</Typography>
      }
    >
      <Stack sx={styles.cardBody}>
        <Grid container columnSpacing={{ xs: 2, md: 6 }} rowSpacing={1.5}>
          {Object.entries(gridColumns).slice(0, -1).map(([key, cols]) => (
            <AddressInfoItem
              cols={cols}
              label={<Skeleton variant="rectangular" width={48} />}
              value={<Skeleton variant="rectangular" width={80} height={20} />}
              key={key}
            />
          ))}
        </Grid>
        {children}
      </Stack>
    </Card>
  );
};

export default AddressCard;
