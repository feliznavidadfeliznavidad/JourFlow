import { useState, useCallback, useEffect } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { Theme } from "react-native-calendars/src/types";
import { Dimensions, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { format, parse } from "date-fns";
import DatabaseService from "../services/database_service";
import colors from "../../assets/colors/colors";
import icons, { IconPath } from "../../assets/icon/icon";

// Define proper interfaces
interface DayComponentProps {
  date: {
    day: number;
    month: number;
    year: number;
    timestamp: number;
    dateString: string;
  };
  marking?: {
    marked?: boolean;
    dot?: DotType | DotType[];
  };
  onPress?: (date: DateData) => void;
}

interface DotType {
  lottieFile: IconPath;
}

interface MarkedDates {
  [key: string]: {
    marked: boolean;
    dot?: DotType | DotType[];
  };
}

const DayComponent: React.FC<DayComponentProps> = ({ date, marking, onPress }) => {
  const dayOfWeek = new Date(date.timestamp).getDay();
  const dateToCheck = new Date(date.timestamp);

  const textColor =
    dayOfWeek === 6
      ? colors.saturday
      : dayOfWeek === 0
      ? colors.sunday
      : colors.textInLight;

  const opacity =
    dateToCheck > new Date() ? 0.3 : 1;

  const renderDots = () => {
    if (!marking?.dot) return null;

    const dots = Array.isArray(marking.dot) ? marking.dot : [marking.dot];

    return (
      <View style={styles.lottieContainer}>
        {dots.map((dot, index) => (
          <LottieView
            key={`${date.dateString}-${index}`}
            source={dot.lottieFile}
            autoPlay
            loop
            style={styles.lottieDot}
          />
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.dayContainer}
      onPress={() => onPress?.(date)}
    >
      <View style={styles.dayContent}>
        {marking?.dot ? (
          renderDots()
        ) : (
          <Text style={[styles.dayText, { color: textColor, opacity }]}>
            {date.day}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const CustomCalendar: React.FC = () => {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  useEffect(() => {
    const initializeApp = async () => {
      await DatabaseService.init();
      await DatabaseService.insertUser(); // Insert clone user data for testing
      await loadMarkedDates();
    };

    initializeApp();
    todayCheck();
  }, []);

  const loadMarkedDates = async () => {
    try {
      const posts = await DatabaseService.getPosts();
      const newMarkedDates: MarkedDates = {};

      posts.forEach(post => {
        const formattedDate = format(post.PostDate, "yyyy-MM-dd");
        newMarkedDates[formattedDate] = {
          marked: true,
          dot: {
            lottieFile: icons[post.IconPath]
          }
        };
      });
      await setMarkedDates(newMarkedDates);
    } catch (error) {
      console.error("Error loading marked dates:", error);
    }
  };

  const handleDayPress = useCallback((day: Date | DateData) => {
    const date = day instanceof Date 
      ? today 
      : new Date(
          day.year, 
          day.month - 1, 
          day.day, 
          today.getHours(), 
          today.getMinutes(), 
          today.getSeconds(), 
          today.getMilliseconds()
        );
  
    const formattedDate = date.toISOString();
    
    DatabaseService.existingDateOfPost(date)
      .then((exists) => {
        if (exists) {
          router.push({
            pathname: "DetailScreen",
            params: { formattedDate },
          });
          console.log(`There is already a post on ${date}.`);
          return;
        }
  
        setSelectedDate(date);
        router.push({
          pathname: "PickFeelingScreen",
          params: { formattedDate },
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [today]);

  const calendarTheme: Theme = {
    textMonthFontFamily: "kalam",
    textDayHeaderFontFamily: "kalam",
    calendarBackground: colors.backgroundLight,
    textSectionTitleColor: colors.textInLight,
    textDayHeaderFontSize: 14,
    textDayFontSize: 14,
    textMonthFontSize: 32,
    dayTextColor: colors.textInLight,
  };

  const [isSelect, setSelect] = useState<boolean>(true);

  const todayCheck = () => {
    DatabaseService.existingDateOfPost(today)
    .then((exists) => {
      if (exists) {
        setSelect(false)
      } else {
        setSelect(true)
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  };

  return (
    <View>
      <View style={styles.calendar}>
        <Calendar
          theme={calendarTheme}
          current={today.toDateString()}
          onDayPress={handleDayPress}
          firstDay={0}
          hideExtraDays={true}
          markedDates={markedDates}
          dayComponent={DayComponent}
        />
      </View>

      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, { opacity: isSelect == false ? 0.2 : 1 }]}
          onPress={() => handleDayPress(today)}
          disabled={isSelect == false}
        >
          <Text style={styles.submitTitle}>
            <AntDesign name="plus" size={24} color="black" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomCalendar;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  calendar: {
    padding: 10,
  },
  buttonContainer: {
    padding: 16,
    gap: 10,
  },
  button: {
    backgroundColor: colors.backgroundDark,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontFamily: "kalam",
    fontSize: 16,
  },
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: width / 7,
    height: width / 7,
  },
  dayContent: {
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  yearHeader: {
    textAlign: "center",
    fontFamily: "kalam",
    fontSize: 22,
  },
  monthHeader: {
    textAlign: "center",
    fontFamily: "kalam",
    fontSize: 32,
  },
  dayText: {
    textAlign: "center",
    fontFamily: "kalam",
  },
  lottieContainer: {
    flexDirection: "row",
    marginTop: 2,
  },
  lottieDot: {
    width: 30,
    height: 30,
  },
  submitContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 100,
  },
  submitButton: {
    height: 50,
    width: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 1,
  },
  submitTitle: {
    fontSize: 18,
    color: "#FAF7F0",
    fontFamily: "Kalam-Regular",
  },
});
