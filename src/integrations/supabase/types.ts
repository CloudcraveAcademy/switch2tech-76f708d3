export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          confirmed_at: string | null
          created_at: string
          deletion_token: string
          email: string
          expires_at: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          deletion_token: string
          email: string
          expires_at?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          deletion_token?: string
          email?: string
          expires_at?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string | null
          feedback: string | null
          file_urls: Json | null
          graded_at: string | null
          id: string
          score: number | null
          student_id: string
          submission_text: string | null
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          feedback?: string | null
          file_urls?: Json | null
          graded_at?: string | null
          id?: string
          score?: number | null
          student_id: string
          submission_text?: string | null
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          feedback?: string | null
          file_urls?: Json | null
          graded_at?: string | null
          id?: string
          score?: number | null
          student_id?: string
          submission_text?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          attachment_url: string | null
          course_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_published: boolean | null
          lesson_id: string | null
          max_score: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachment_url?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_published?: boolean | null
          lesson_id?: string | null
          max_score?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachment_url?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_published?: boolean | null
          lesson_id?: string | null
          max_score?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string | null
          course_id: string
          created_at: string | null
          id: string
          issue_date: string | null
          pdf_url: string | null
          student_id: string
          updated_at: string | null
          verification_code: string | null
        }
        Insert: {
          certificate_number?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          issue_date?: string | null
          pdf_url?: string | null
          student_id: string
          updated_at?: string | null
          verification_code?: string | null
        }
        Update: {
          certificate_number?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          issue_date?: string | null
          pdf_url?: string | null
          student_id?: string
          updated_at?: string | null
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_attendance: {
        Row: {
          attendance_status: string | null
          attended_at: string | null
          class_session_id: string
          course_id: string
          created_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          attendance_status?: string | null
          attended_at?: string | null
          class_session_id: string
          course_id: string
          created_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          attendance_status?: string | null
          attended_at?: string | null
          class_session_id?: string
          course_id?: string
          created_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_attendance_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          course_id: string
          created_at: string | null
          end_time: string
          id: string
          meeting_link: string | null
          start_time: string
          status: string | null
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          end_time: string
          id?: string
          meeting_link?: string | null
          start_time: string
          status?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          meeting_link?: string | null
          start_time?: string
          status?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lesson_id: string | null
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_settings: {
        Row: {
          commission_percentage: number
          created_at: string
          created_by: string | null
          id: string
          updated_at: string
        }
        Insert: {
          commission_percentage?: number
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          commission_percentage?: number
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_announcements: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_course_announcements_course"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      course_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string | null
          first_name: string | null
          id: string
          instructor_id: string | null
          instructor_name: string
          last_name: string | null
          message: string | null
          sent_at: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          first_name?: string | null
          id?: string
          instructor_id?: string | null
          instructor_name: string
          last_name?: string | null
          message?: string | null
          sent_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          first_name?: string | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string
          last_name?: string | null
          message?: string | null
          sent_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_materials: {
        Row: {
          course_id: string
          created_at: string | null
          file_type: string | null
          file_url: string | null
          id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_ratings: {
        Row: {
          course_id: string
          created_at: string
          id: string
          rating: number
          review: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_ratings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          access_duration: string | null
          additional_languages: string[] | null
          category: string | null
          certificate_enabled: boolean | null
          class_days: string[] | null
          class_time: string | null
          course_materials: string[] | null
          course_start_date: string | null
          created_at: string | null
          description: string | null
          discounted_price: number | null
          duration_hours: number | null
          id: string
          image_url: string | null
          instructor_id: string
          is_published: boolean | null
          language: string | null
          level: string | null
          mode: string | null
          multi_language_support: boolean | null
          preview_video: string | null
          price: number | null
          registration_deadline: string | null
          replay_access: boolean | null
          timezone: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          access_duration?: string | null
          additional_languages?: string[] | null
          category?: string | null
          certificate_enabled?: boolean | null
          class_days?: string[] | null
          class_time?: string | null
          course_materials?: string[] | null
          course_start_date?: string | null
          created_at?: string | null
          description?: string | null
          discounted_price?: number | null
          duration_hours?: number | null
          id?: string
          image_url?: string | null
          instructor_id: string
          is_published?: boolean | null
          language?: string | null
          level?: string | null
          mode?: string | null
          multi_language_support?: boolean | null
          preview_video?: string | null
          price?: number | null
          registration_deadline?: string | null
          replay_access?: boolean | null
          timezone?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          access_duration?: string | null
          additional_languages?: string[] | null
          category?: string | null
          certificate_enabled?: boolean | null
          class_days?: string[] | null
          class_time?: string | null
          course_materials?: string[] | null
          course_start_date?: string | null
          created_at?: string | null
          description?: string | null
          discounted_price?: number | null
          duration_hours?: number | null
          id?: string
          image_url?: string | null
          instructor_id?: string
          is_published?: boolean | null
          language?: string | null
          level?: string | null
          mode?: string | null
          multi_language_support?: boolean | null
          preview_video?: string | null
          price?: number | null
          registration_deadline?: string | null
          replay_access?: boolean | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_boards: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_boards_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          content: string
          created_at: string | null
          discussion_board_id: string
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          discussion_board_id: string
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          discussion_board_id?: string
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_discussion_board_id_fkey"
            columns: ["discussion_board_id"]
            isOneToOne: false
            referencedRelation: "discussion_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed: boolean | null
          completion_date: string | null
          course_id: string
          enrollment_date: string | null
          id: string
          progress: number | null
          student_id: string
        }
        Insert: {
          completed?: boolean | null
          completion_date?: string | null
          course_id: string
          enrollment_date?: string | null
          id?: string
          progress?: number | null
          student_id: string
        }
        Update: {
          completed?: boolean | null
          completion_date?: string | null
          course_id?: string
          enrollment_date?: string | null
          id?: string
          progress?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_payouts: {
        Row: {
          commission_amount: number
          commission_percentage: number
          created_at: string
          created_by: string | null
          currency: string
          gross_revenue: number
          id: string
          instructor_id: string
          net_payout: number
          paid_at: string | null
          payment_reference: string | null
          period_end: string
          period_start: string
          status: string
          updated_at: string
        }
        Insert: {
          commission_amount?: number
          commission_percentage: number
          created_at?: string
          created_by?: string | null
          currency?: string
          gross_revenue?: number
          id?: string
          instructor_id: string
          net_payout?: number
          paid_at?: string | null
          payment_reference?: string | null
          period_end: string
          period_start: string
          status?: string
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          gross_revenue?: number
          id?: string
          instructor_id?: string
          net_payout?: number
          paid_at?: string | null
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      internship_applications: {
        Row: {
          application_text: string | null
          created_at: string | null
          id: string
          program_id: string
          resume_url: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          application_text?: string | null
          created_at?: string | null
          id?: string
          program_id: string
          resume_url?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          application_text?: string | null
          created_at?: string | null
          id?: string
          program_id?: string
          resume_url?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "internship_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_programs: {
        Row: {
          company: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          max_interns: number | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_interns?: number | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_interns?: number | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          order_number: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          order_number: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          order_number?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_applications: {
        Row: {
          application_text: string | null
          created_at: string | null
          id: string
          mentor_id: string | null
          program_id: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          application_text?: string | null
          created_at?: string | null
          id?: string
          mentor_id?: string | null
          program_id: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          application_text?: string | null
          created_at?: string | null
          id?: string
          mentor_id?: string | null
          program_id?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_applications_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "mentorship_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_programs: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          max_participants: number | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_participants?: number | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_message_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_message_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_message_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          course_id: string | null
          created_at: string
          description: string
          id: string
          instructor_id: string | null
          metadata: Json | null
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          course_id?: string | null
          created_at?: string
          description: string
          id?: string
          instructor_id?: string | null
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          course_id?: string | null
          created_at?: string
          description?: string
          id?: string
          instructor_id?: string | null
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          configuration: Json | null
          created_at: string
          gateway_name: string
          id: string
          is_active: boolean
          public_key: string | null
          secret_key: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          gateway_name: string
          id?: string
          is_active?: boolean
          public_key?: string | null
          secret_key?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          gateway_name?: string
          id?: string
          is_active?: boolean
          public_key?: string | null
          secret_key?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_reference: string | null
          paystack_reference: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          paystack_reference?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          paystack_reference?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          id: string
          options: Json | null
          order_number: number | null
          points: number | null
          question: string
          question_type: string | null
          quiz_id: string
          updated_at: string | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          order_number?: number | null
          points?: number | null
          question: string
          question_type?: string | null
          quiz_id: string
          updated_at?: string | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          order_number?: number | null
          points?: number | null
          question?: string
          question_type?: string | null
          quiz_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          answers: Json | null
          created_at: string
          id: string
          is_passed: boolean | null
          max_score: number
          percentage: number
          quiz_id: string
          score: number
          student_id: string
          submitted_at: string
          time_taken_minutes: number | null
          updated_at: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: string
          is_passed?: boolean | null
          max_score?: number
          percentage?: number
          quiz_id: string
          score?: number
          student_id: string
          submitted_at?: string
          time_taken_minutes?: number | null
          updated_at?: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: string
          is_passed?: boolean | null
          max_score?: number
          percentage?: number
          quiz_id?: string
          score?: number
          student_id?: string
          submitted_at?: string
          time_taken_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          lesson_id: string | null
          passing_score: number | null
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          lesson_id?: string | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          lesson_id?: string | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_lesson_progress: {
        Row: {
          completed: boolean
          course_id: string
          created_at: string | null
          id: string
          last_accessed: string | null
          lesson_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean
          course_id: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          lesson_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean
          course_id?: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          lesson_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_success_stories: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company: string
          created_at: string
          id: string
          image_url: string | null
          is_approved: boolean
          is_featured: boolean
          name: string
          role: string
          story: string
          submitted_by: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_featured?: boolean
          name: string
          role: string
          story: string
          submitted_by?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          is_featured?: boolean
          name?: string
          role?: string
          story?: string
          submitted_by?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_responses: {
        Row: {
          created_at: string | null
          id: string
          response: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          response: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          response?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          account_name: string | null
          account_number: string | null
          avatar_url: string | null
          bank_name: string | null
          bank_verification_status: string | null
          bio: string | null
          career_level: string | null
          country: string | null
          created_at: string | null
          first_name: string | null
          github_url: string | null
          id: string
          last_name: string | null
          linkedin_url: string | null
          payout_frequency: string | null
          paystack_recipient_code: string | null
          phone: string | null
          preferences: Json | null
          professional_title: string | null
          role: string
          skills: string | null
          student_status: string | null
          twitter_url: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          avatar_url?: string | null
          bank_name?: string | null
          bank_verification_status?: string | null
          bio?: string | null
          career_level?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          github_url?: string | null
          id: string
          last_name?: string | null
          linkedin_url?: string | null
          payout_frequency?: string | null
          paystack_recipient_code?: string | null
          phone?: string | null
          preferences?: Json | null
          professional_title?: string | null
          role: string
          skills?: string | null
          student_status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          avatar_url?: string | null
          bank_name?: string | null
          bank_verification_status?: string | null
          bio?: string | null
          career_level?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          github_url?: string | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          payout_frequency?: string | null
          paystack_recipient_code?: string | null
          phone?: string | null
          preferences?: Json | null
          professional_title?: string | null
          role?: string
          skills?: string | null
          student_status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      payment_gateways_safe: {
        Row: {
          configuration: Json | null
          created_at: string | null
          gateway_name: string | null
          id: string | null
          is_active: boolean | null
          public_key: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          gateway_name?: string | null
          id?: string | null
          is_active?: boolean | null
          public_key?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          gateway_name?: string | null
          id?: string | null
          is_active?: boolean | null
          public_key?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_attendance_progress: {
        Args: { student_id_param: string; course_id_param: string }
        Returns: number
      }
      check_course_completion_requirements: {
        Args: { student_id_param: string; course_id_param: string }
        Returns: boolean
      }
      check_virtual_live_completion: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_course_announcement: {
        Args: {
          course_id_param: string
          title_param: string
          content_param: string
        }
        Returns: string
      }
      delete_course_announcement: {
        Args: { announcement_id_param: string }
        Returns: boolean
      }
      get_admin_payment_gateway_config: {
        Args: { gateway_name_param: string }
        Returns: {
          public_key: string
          is_active: boolean
          configuration: Json
          gateway_name: string
        }[]
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_course_announcements: {
        Args: { course_id_param: string }
        Returns: {
          content: string
          course_id: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }[]
      }
      get_course_rating_stats: {
        Args: { course_id_param: string }
        Returns: {
          average_rating: number
          total_ratings: number
          rating_distribution: Json
        }[]
      }
      get_current_commission_percentage: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_public_payment_gateway_config: {
        Args: { gateway_name_param: string }
        Returns: {
          public_key: string
          is_active: boolean
          gateway_name: string
        }[]
      }
      get_user_emails: {
        Args: { user_ids: string[] }
        Returns: {
          id: string
          email: string
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { role: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_course_instructor_for_lessons: {
        Args: { course_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      issue_missing_certificates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_course_announcement: {
        Args: {
          announcement_id_param: string
          title_param: string
          content_param: string
        }
        Returns: boolean
      }
      verify_certificate: {
        Args: { cert_number: string }
        Returns: {
          certificate_id: string
          student_name: string
          course_title: string
          issue_date: string
          verification_code: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
