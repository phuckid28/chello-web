import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { collectBoardCardsWithColumn, getDeadlineStatus } from '~/utils/excelExporter'
import { formatMessage } from '~/utils/i18nV5'

const REMINDER_STORAGE_PREFIX = 'chella_deadline_reminder_'
const REMINDER_DELAY_MS = 1200

const todayKey = () => new Date().toISOString().slice(0, 10)

const alreadyRemindedToday = (boardId) => {
  try {
    return localStorage.getItem(`${REMINDER_STORAGE_PREFIX}${boardId}`) === todayKey()
  } catch (e) {
    // Storage unavailable → still remind, just without de-duplication
    return false
  }
}

const markReminded = (boardId) => {
  try {
    localStorage.setItem(`${REMINDER_STORAGE_PREFIX}${boardId}`, todayKey())
  } catch (e) {
    // Non-critical; worst case the user sees the reminder again
  }
}

// Shows at most one deadline digest toast per board per day when the board is opened
export const useDeadlineReminder = (board, template) => {
  const boardId = board?._id
  useEffect(() => {
    if (!boardId || alreadyRemindedToday(boardId)) return undefined

    const counts = collectBoardCardsWithColumn(board).reduce((acc, { card }) => {
      const { code } = getDeadlineStatus(card)
      if (code === 'overdue') acc.overdue += 1
      if (code === 'due-soon') acc.soon += 1
      return acc
    }, { overdue: 0, soon: 0 })

    if (counts.overdue + counts.soon === 0) return undefined

    const timer = setTimeout(() => {
      markReminded(boardId)
      const message = formatMessage(template, { ...counts, sprint: board?.sprintConfig?.name || 'Sprint' })
      const notify = counts.overdue > 0 ? toast.warning : toast.info
      notify(message, { autoClose: 6500 })
    }, REMINDER_DELAY_MS)
    return () => clearTimeout(timer)
    // Only re-evaluate when switching boards, not on every card edit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId])
}
