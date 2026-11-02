import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import CancelIcon from '@mui/icons-material/Cancel'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import AbcIcon from '@mui/icons-material/Abc'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import { Controller } from 'react-hook-form'
import LoadingButton from '~/components/Loading/LoadingButton'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { FIELD_REQUIRED_MESSAGE } from '~/utils/validators'
import { SoraBunnyIcon } from '~/components/Icons/SoraBunnyIcon'

export function CreateBoardModal({
  isOpenModal,
  onClose,
  themeConfig,
  globalPersonaKey,
  boardTypes,
  control,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
  t,
  tPrimary
}) {
  return (
    <Modal
      open={isOpenModal}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 660,
        maxWidth: '94vw',
        boxShadow: 24,
        borderRadius: '16px',
        border: `1px solid ${themeConfig.accentColor}`,
        outline: 0,
        padding: '24px 30px',
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff')
      }}>
        <Box sx={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          cursor: 'pointer'
        }}>
          <CancelIcon
            color="error"
            sx={{ '&:hover': { color: 'error.light' } }}
            onClick={onClose}
          />
        </Box>
        <Box id="modal-modal-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SoraBunnyIcon />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
            {t('createNewSprintBoard')} (Board = Sprint)
          </Typography>
        </Box>
        <Box id="modal-modal-description" sx={{ my: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  label={tPrimary('boardTitleInputLabel')}
                  type="text"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AbcIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  {...register('title', {
                    required: FIELD_REQUIRED_MESSAGE,
                    minLength: { value: 3, message: tPrimary('min3CharsMsg') },
                    maxLength: { value: 50, message: tPrimary('max50CharsMsg') }
                  })}
                  error={!!errors['title']}
                />
                <FieldErrorAlert errors={errors} fieldName={'title'} />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label={tPrimary('boardDescInputLabel')}
                  type="text"
                  variant="outlined"
                  multiline
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  {...register('description', {
                    required: FIELD_REQUIRED_MESSAGE,
                    minLength: { value: 3, message: tPrimary('min3CharsMsg') },
                    maxLength: { value: 256, message: tPrimary('max256CharsMsg') }
                  })}
                  error={!!errors['description']}
                />
                <FieldErrorAlert errors={errors} fieldName={'description'} />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  {t('selectThemeLabel')}:
                </Typography>
                <Controller
                  name="theme"
                  defaultValue={globalPersonaKey}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      row
                      onChange={(event, value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControlLabel
                        value="cosmos"
                        control={<Radio size="small" />}
                        label="🌌 Vũ Trụ & Hoàng Đạo (Cosmos)"
                      />
                      <FormControlLabel
                        value="wind-chime"
                        control={<Radio size="small" />}
                        label="🎐 Bầu Trời Xanh & Chuông Gió (Furin)"
                      />
                      <FormControlLabel
                        value="sora-sky"
                        control={<Radio size="small" />}
                        label="☁️ Sora (Distant Sky)"
                      />
                      <FormControlLabel
                        value="furina"
                        control={<Radio size="small" />}
                        label="💧 Furina (Fontaine Opera)"
                      />
                      <FormControlLabel
                        value="nahida"
                        control={<Radio size="small" />}
                        label="🌿 Nahida (Sumeru Wisdom)"
                      />
                      <FormControlLabel
                        value="sora-twilight"
                        control={<Radio size="small" />}
                        label="🎀 Sora (Moonlit Ribbon)"
                      />
                      <FormControlLabel
                        value="sora-usagi"
                        control={<Radio size="small" />}
                        label="🐰 Sora & Usagi Plush"
                      />
                    </RadioGroup>
                  )}
                />
              </Box>

              <Controller
                name="type"
                defaultValue={boardTypes.PUBLIC}
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    row
                    onChange={(event, value) => field.onChange(value)}
                    value={field.value}
                  >
                    <FormControlLabel
                      value={boardTypes.PUBLIC}
                      control={<Radio size="small" />}
                      label={tPrimary('publicBoardRadio')}
                      labelPlacement="start"
                    />
                    <FormControlLabel
                      value={boardTypes.PRIVATE}
                      control={<Radio size="small" />}
                      label={tPrimary('privateBoardRadio')}
                      labelPlacement="start"
                    />
                  </RadioGroup>
                )}
              />

              <Controller
                name="useTemplate"
                defaultValue={true}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                        size="small"
                      />
                    }
                    label={tPrimary('seedTemplateCheckboxLabel')}
                  />
                )}
              />

              <Box sx={{ alignSelf: 'flex-end' }}>
                <LoadingButton
                  className="interceptor-loading"
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={isSubmitting}
                >
                  {t('createBoardSubmitBtn')}
                </LoadingButton>
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Modal>
  )
}

export function ArtworkLightboxModal({ previewArt, onClose, themeConfig, tPrimary }) {
  return (
    <Modal open={Boolean(previewArt)} onClose={onClose}>
      <Box
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 820,
          maxWidth: '94vw',
          borderRadius: '18px',
          overflow: 'hidden',
          bgcolor: '#090d16',
          border: `1px solid ${themeConfig.accentColor}`,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
          outline: 0,
          animation: 'chelloFadeSlideUp 0.24s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        {previewArt && (
          <>
            <Box
              component="img"
              src={previewArt.url}
              alt={previewArt.label}
              sx={{ width: '100%', maxHeight: '74vh', objectFit: 'contain', display: 'block', bgcolor: '#05070c' }}
            />
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SoraBunnyIcon />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {previewArt.label}
                </Typography>
              </Box>
              <Chip
                label={`${tPrimary('clickAnywhereToClose')} ${themeConfig.name}`}
                size="small"
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.14)', fontWeight: 700 }}
              />
            </Box>
          </>
        )}
      </Box>
    </Modal>
  )
}
