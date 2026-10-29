import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import AddLinkRoundedIcon from '@mui/icons-material/AddLinkRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { toast } from 'react-toastify'
import { uploadFrdToGoogleDriveAPI } from '~/apis'
import { downloadAttachedFrdFile } from '~/utils/excelExporter'
import { playUiChime } from '~/utils/soundEffects'
import LoadingButton from '~/components/Loading/LoadingButton'

const extractGoogleDriveFileId = (rawUrl) => {
  const url = String(rawUrl || '').trim()
  if (!url) return null
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]{15,})/)
  if (fileMatch) return fileMatch[1]
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{15,})/)
  if (idParamMatch) return idParamMatch[1]
  return null
}

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = String(e.target?.result || '')
    const commaIdx = dataUrl.indexOf(',')
    resolve({
      dataUrl,
      base64: commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl
    })
  }
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const fileToText = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(String(e.target?.result || ''))
  reader.onerror = reject
  reader.readAsText(file, 'UTF-8')
})

function GoogleDriveFrdControls({
  boardId,
  activeCard,
  onAppendFrdDoc,
  onDeleteFrdDoc,
  onApplyFrdToDescription
}) {
  const [uploadingDrive, setUploadingDrive] = useState(false)
  const [showDriveLinkInput, setShowDriveLinkInput] = useState(false)
  const [driveUrlInput, setDriveUrlInput] = useState('')
  const [driveTitleInput, setDriveTitleInput] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)

  const handleUploadToDriveVault = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (file.size > 4.2 * 1024 * 1024) {
      toast.warning('Kích thước file tối đa 4.2MB mỗi lần tải lên!')
      return
    }

    const isTextOrMd = /\.(md|markdown|txt|json|csv)$/i.test(file.name)
    setUploadingDrive(true)

    try {
      const [{ dataUrl, base64 }, textContent] = await Promise.all([
        fileToBase64(file),
        isTextOrMd ? fileToText(file) : Promise.resolve('')
      ])

      let driveRes = null
      try {
        driveRes = await uploadFrdToGoogleDriveAPI({
          boardId,
          crCode: activeCard?.crCode || 'CR',
          fileName: file.name,
          mimeType: file.type || (isTextOrMd ? 'text/markdown' : 'application/octet-stream'),
          base64Data: base64
        })
      } catch (driveErr) {
        driveRes = { ok: false }
      }

      if (driveRes?.ok && driveRes?.fileId) {
        const newDoc = {
          id: `frd-drive-${Date.now()}`,
          name: driveRes.name || file.name,
          type: file.type || (isTextOrMd ? 'text/markdown' : 'application/octet-stream'),
          size: driveRes.size || file.size,
          content: isTextOrMd ? textContent : '',
          source: 'google-drive',
          driveFileId: driveRes.fileId,
          webViewLink: driveRes.webViewLink,
          previewUrl: driveRes.previewUrl,
          downloadUrl: driveRes.downloadUrl,
          uploadedAt: Date.now()
        }
        await onAppendFrdDoc(newDoc, isTextOrMd ? textContent : '')
        playUiChime('complete')
        toast.success(`☁️ Đã lưu "${file.name}" lên Google Drive Vault thành công!`)
        return
      }

      // Graceful fallback: still attach to CR card even if Drive script needs permission tweak
      const fallbackDoc = {
        id: `frd-${Date.now()}`,
        name: file.name,
        type: file.type || (isTextOrMd ? 'text/markdown' : 'application/octet-stream'),
        size: file.size,
        content: isTextOrMd ? textContent : dataUrl,
        source: 'upload',
        uploadedAt: Date.now()
      }
      await onAppendFrdDoc(fallbackDoc, isTextOrMd ? textContent : '')
      playUiChime('complete')
      if (driveRes?.message) {
        toast.info(driveRes.message, { autoClose: 7000 })
      } else {
        toast.success(`Đã đính kèm tài liệu FRD "${file.name}" vào thẻ CR!`)
      }
    } catch (err) {
      // Handled by interceptor
    } finally {
      setUploadingDrive(false)
    }
  }

  const handleAttachExistingDriveLink = async () => {
    const fileId = extractGoogleDriveFileId(driveUrlInput)
    if (!fileId) {
      toast.warning('Vui lòng dán đường dẫn hợp lệ từ Google Drive / Docs (có chứa /d/<ID>/)!')
      return
    }
    const cleanTitle = driveTitleInput.trim() || `FRD_${activeCard?.crCode || 'CR'}_Drive.pdf`
    const newDoc = {
      id: `frd-drivelink-${Date.now()}`,
      name: cleanTitle,
      type: 'application/pdf',
      size: 0,
      content: '',
      source: 'google-drive',
      driveFileId: fileId,
      webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      uploadedAt: Date.now()
    }
    await onAppendFrdDoc(newDoc, '')
    setDriveUrlInput('')
    setDriveTitleInput('')
    setShowDriveLinkInput(false)
    playUiChime('complete')
    toast.success(`☁️ Đã liên kết tài liệu Google Drive "${cleanTitle}" vào CR!`)
  }

  const docs = activeCard?.frdDocuments || []

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1.25, flexWrap: 'wrap', gap: 1 }}>
        <LoadingButton
          component="label"
          size="small"
          variant="contained"
          color="info"
          loading={uploadingDrive}
          loadingLabel="Đang đẩy lên Drive..."
          startIcon={<CloudUploadRoundedIcon />}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
        >
          ☁️ Upload FRD lên Google Drive (.PDF / .DOCX / .MD)
          <input
            type="file"
            hidden
            accept=".md,.markdown,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.json"
            onChange={handleUploadToDriveVault}
          />
        </LoadingButton>

        <Button
          size="small"
          variant="outlined"
          color="info"
          startIcon={<AddLinkRoundedIcon />}
          onClick={() => setShowDriveLinkInput((prev) => !prev)}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
        >
          Gắn link Google Drive có sẵn
        </Button>
      </Stack>

      {showDriveLinkInput && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{
            mb: 1.5,
            p: 1.25,
            borderRadius: '10px',
            border: '1px dashed rgba(56, 189, 248, 0.45)',
            bgcolor: 'background.paper'
          }}
        >
          <TextField
            size="small"
            fullWidth
            label="Link Google Drive / Google Docs (https://drive.google.com/file/d/...)"
            value={driveUrlInput}
            onChange={(e) => setDriveUrlInput(e.target.value)}
          />
          <TextField
            size="small"
            label="Tên hiển thị (tuỳ chọn)"
            value={driveTitleInput}
            onChange={(e) => setDriveTitleInput(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 200 } }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={handleAttachExistingDriveLink}
            sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            Liên kết Drive
          </Button>
        </Stack>
      )}

      {docs.length > 0 ? (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {docs.map((doc) => {
            const isDrive = Boolean(doc.driveFileId || doc.source === 'google-drive' || doc.previewUrl)
            const hasTextContent = Boolean(doc.content && !String(doc.content).startsWith('data:'))
            return (
              <Box
                key={doc.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  bgcolor: 'background.paper',
                  gap: 1,
                  flexWrap: 'wrap'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <DescriptionOutlinedIcon fontSize="small" color={isDrive ? 'info' : 'secondary'} />
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {doc.name}
                      </Typography>
                      {isDrive && (
                        <Chip
                          size="small"
                          color="info"
                          variant="outlined"
                          label="☁️ Google Drive"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {doc.size ? `${Math.max(1, Math.round(doc.size / 1024))} KB • ` : ''}
                      {isDrive ? 'Google Drive Vault' : (doc.source === 'antigravity-template' ? 'FRD Spec' : 'FRD Document')}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                  {(isDrive || hasTextContent) && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="info"
                      startIcon={<VisibilityRoundedIcon fontSize="small" />}
                      onClick={() => setPreviewDoc(doc)}
                      sx={{ textTransform: 'none', fontSize: '0.74rem', fontWeight: 700, py: 0.25 }}
                    >
                      Xem
                    </Button>
                  )}
                  {isDrive && doc.webViewLink && (
                    <IconButton
                      size="small"
                      color="info"
                      component="a"
                      href={doc.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Mở trên Google Drive"
                    >
                      <OpenInNewRoundedIcon fontSize="small" />
                    </IconButton>
                  )}
                  {hasTextContent && (
                    <Button
                      size="small"
                      onClick={() => onApplyFrdToDescription(doc)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      Nạp vào Mô tả
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      if (isDrive && doc.downloadUrl) {
                        window.open(doc.downloadUrl, '_blank', 'noopener,noreferrer')
                      } else {
                        downloadAttachedFrdFile(doc)
                      }
                    }}
                    title="Tải xuống file FRD"
                  >
                    <DownloadRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDeleteFrdDoc(doc.id)}
                    title="Xóa file FRD"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            )
          })}
        </Stack>
      ) : (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1.5 }}>
          Chưa có file FRD đính kèm. Bạn có thể tải trực tiếp lên Google Drive Vault (.PDF, .DOCX, .XLSX, .MD) hoặc gắn link Drive có sẵn.
        </Typography>
      )}

      {/* Embedded Preview Modal for Google Drive / Markdown FRD */}
      <Dialog
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            📄 {previewDoc?.name}
          </Typography>
          {previewDoc?.webViewLink && (
            <Button
              size="small"
              variant="outlined"
              endIcon={<OpenInNewRoundedIcon />}
              component="a"
              href={previewDoc.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Mở trên Google Drive
            </Button>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, minHeight: '68vh' }}>
          {previewDoc?.previewUrl ? (
            <Box
              component="iframe"
              src={previewDoc.previewUrl}
              title={previewDoc.name}
              sx={{ width: '100%', height: '68vh', border: 'none', display: 'block' }}
              allow="autoplay"
            />
          ) : (
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2.5,
                maxHeight: '68vh',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                whiteSpace: 'pre-wrap'
              }}
            >
              {previewDoc?.content || 'Không có nội dung văn bản xem trước.'}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDoc(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GoogleDriveFrdControls
