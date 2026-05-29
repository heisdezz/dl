import React from "react";
import { View, Text, FlatList } from "react-native";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { Color } from "expo-router";
import { useHistoryStore } from "@/lib/history";
import { HistoryCard } from "@/components/history-card";

const dyn = Color.android.dynamic;

export default function Videos() {
  const history = useHistoryStore((state) => state.history);

  return (
    <PageWrap>
      <View style={tw`p-4 flex-1`}>
        <Text style={[tw`text-2xl font-bold mb-6`, { color: dyn.onSurface }]}>
          Download History
        </Text>

        {history.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <Text
              style={[
                tw`text-base opacity-50`,
                { color: dyn.onSurfaceVariant },
              ]}
            >
              No downloads yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HistoryCard item={item} />}
            contentContainerStyle={tw`pb-24`}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </PageWrap>
  );
}
