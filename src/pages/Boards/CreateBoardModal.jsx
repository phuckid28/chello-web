import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import CancelIcon from '@mui/icons-material/Cancel'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import AbcIcon from '@mui/icons-material/Abc'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { Controller } from 'react-hook-form'
import LoadingButton from '~/components/Loading/LoadingButton'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { FIELD_REQUIRED_MESSAGE } from '~/utils/validators'
import { DEFAULT_SPRINT_TEMPLATE } from '~/utils/animeTheme'
import { SoraBunnyIcon } from '~/components/Icons/SoraBunnyIcon'

export function CreateBoardModal({
  isOpenModal,
  onClose,
  themeConfig,
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
        width: 640,
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
                  placeholder="VD: Sprint 34 • Core Platform & CR Delivery"
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
                  placeholder="Mô tả mục tiêu Sprint, phạm vi CR và tài liệu FRD..."
                  type="text"
                  variant="outlined"
                  multiline
                  minRows={2}
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

              {/* Unified Standard Sprint Template Preview */}
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  border: `1px solid ${themeConfig.columnBorder}`,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.72)' : 'rgba(248, 250, 252, 0.9)')
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <ViewKanbanRoundedIcon fontSize="small" sx={{ color: themeConfig.accentColor }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {DEFAULT_SPRINT_TEMPLATE.title}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={DEFAULT_SPRINT_TEMPLATE.badge}
                    sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, color: '#0f172a', bgcolor: themeConfig.accentColor }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Tất cả các Board / Sprint đều dùng chung 1 kiểu template chuẩn thống nhất và tự động hiển thị theo chủ đề giao diện của Web App ({themeConfig.name.split('•')[0].trim()}):
                </Typography>
                <Stack spacing={0.4} sx={{ mb: 1 }}>
                  {DEFAULT_SPRINT_TEMPLATE.modules.map((mod) => (
                    <Box key={mod} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CheckCircleOutlineRoundedIcon sx={{ fontSize: 14, color: themeConfig.accentColor, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {mod}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Controller
                  name="useTemplate"
                  defaultValue={true}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          checked={Boolean(field.value)}
                          onChange={(e) => field.onChange(e.target.checked)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {tPrimary('seedTemplateCheckboxLabel')}
                        </Typography>
                      }
                    />
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
