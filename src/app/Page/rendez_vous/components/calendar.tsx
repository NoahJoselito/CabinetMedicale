"use client"

import { useState, useEffect } from "react"

interface Appointment {
  id: string;
  date: string;
  time: string;
  patientName: string;
  doctorName: string;
}

const Calendar = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const currentDay = new Date().getDate()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const daysInMonth = 31

  const startDayOffset = new Date(currentYear, currentMonth, 1).getDay() // Day of week (0 = Sun, 1 = Mon, ...)

  // Simuler le chargement des rendez-vous (à remplacer par votre API)
  useEffect(() => {
    const currentDateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`
    const mockAppointments: Appointment[] = [
      {
        id: "1",
        date: `${currentDateStr}-10`,
        time: "09:00",
        patientName: "John Doe",
        doctorName: "Dr. Smith"
      },
      {
        id: "2",
        date: `${currentDateStr}-10`,
        time: "10:30",
        patientName: "Marie Durant",
        doctorName: "Dr. Martin"
      },
      {
        id: "3",
        date: `${currentDateStr}-12`,
        time: "14:00",
        patientName: "Pierre Dubois",
        doctorName: "Dr. Garcia"
      },
      {
        id: "4",
        date: `${currentDateStr}-15`,
        time: "15:30",
        patientName: "Sophie Lambert",
        doctorName: "Dr. Smith"
      },
      {
        id: "5",
        date: `${currentDateStr}-17`,
        time: "11:00",
        patientName: "Lucas Martin",
        doctorName: "Dr. Brown"
      },
      {
        id: "6",
        date: `${currentDateStr}-20`,
        time: "09:30",
        patientName: "Emma Wilson",
        doctorName: "Dr. Martin"
      },
      {
        id: "7",
        date: `${currentDateStr}-20`,
        time: "16:00",
        patientName: "Thomas Bernard",
        doctorName: "Dr. Garcia"
      }
    ]
    setAppointments(mockAppointments)
  }, [currentYear, currentMonth])

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
    setSelectedDate(dateStr)
    setSelectedTime(null)
  }

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time)
  }

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
    return appointments.filter(apt => apt.date === dateStr)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
      </h2>

      <div className="grid grid-cols-7 gap-3 mb-4">
        {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
          <div key={day} className="text-sm font-semibold text-center text-gray-500 ">
            {day}
          </div>
        ))}

        {/* Espaces vides pour les jours avant le 1er */}
        {Array(startDayOffset)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dayAppointments = getAppointmentsForDay(day)
          const hasAppointments = dayAppointments.length > 0
          const isSelected = selectedDate === `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`

          return (
            <div key={day} className="relative">
              <button
                onClick={() => setSelectedDate(hasAppointments ? `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}` : null)}
                className={`w-full h-20 p-1 border rounded-lg relative cursor-pointer
                    ${isSelected ? "border-blue-600" : "border-gray-200"}
                    ${hasAppointments ? "bg-blue-50" : "bg-white"}`}
              >
                <span className="absolute top-1 left-1">{day}</span>
                {hasAppointments && (
                  <div className="mt-6 text-xs">
                    {dayAppointments.map(apt => (
                      <div key={apt.id} className="text-blue-600 truncate">
                        {apt.time} - {apt.patientName}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Liste détaillée des rendez-vous */}
      {selectedDate && (
        <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-500 text-white px-4 py-3">
            <h3 className="text-lg font-semibold">
              Rendez-vous du {new Date(selectedDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {getAppointmentsForDay(parseInt(selectedDate.split('-')[2])).length > 0 ? (
              getAppointmentsForDay(parseInt(selectedDate.split('-')[2])).map(apt => (
                <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">Heure</span>
                      <p className="font-semibold">{apt.time}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Patient</span>
                      <p className="font-semibold">{apt.patientName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Docteur</span>
                      <p className="font-semibold">{apt.doctorName}</p>
                    </div>
                    <div className="flex items-center justify-end">
                      <button className="text-blue-500 hover:text-blue-600 cursor-pointer">
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                Aucun rendez-vous programmé pour cette date
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
