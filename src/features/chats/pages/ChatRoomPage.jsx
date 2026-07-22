import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getMessages, markConversationRead, sendMessage } from '../../../shared/api/services/chatService'
import {
  getChatHubConnection,
  joinConversationHub,
  leaveConversationHub,
  onReceiveMessage,
  onUserTyping,
  sendTypingHub,
} from '../../../shared/api/chatHubService'
import SignLanguagePanel from '../components/SignLanguagePanel'
import { speakTranslation } from '../../../shared/utils/speakTranslation'
import { APP_ROUTES } from '../../../shared/config/paths'



export default ChatRoomPage
