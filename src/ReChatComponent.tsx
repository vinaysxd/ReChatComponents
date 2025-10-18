// ReChatComponent TODO List
// 📦 Props & Configuration

import { Ionicons } from "@expo/vector-icons";
import { JSX, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
 

export type ReChatMessage = {
  id: number;
  sender_id: number;
  content: string;
  timestamp: string;
};

export type ReChatPagination = {
  page: number;
  limit: number;
  totalMessages?: number;
  totalPages?: number;
};

export type ReChatResponse = {
  messages: ReChatMessage[];
  pagination: ReChatPagination;
};

export interface ReChatComponentProps { 
  url: string;
  currentUserId: number;  
  token?: string | null; 
  useFormatter?: boolean; 
  formatter?: (data: any) => ReChatResponse;  
  socket?: any; 
  useSocket?: boolean; 
  customRenderItems?: (info: { item: ReChatMessage; index: number })    => JSX.Element; 
  initialPage?: number; 
  page ?: number; 
  limit? : number;
  autoScrollOnMount?: boolean;
  customFetch?: (page:number, limit: number)=>Promise<ReChatResponse>
}
const ReChatComponent = ({ url,token, page = 1, limit = 20, useFormatter, formatter, customFetch, customRenderItems, currentUserId, socket  }:ReChatComponentProps)=>{
  const [messages, setMessages ] = useState<ReChatMessage[]  >([]) 
  const [pagination, setPagination] = useState<ReChatPagination>({page: page , limit: limit})
  const [newMessage, setNewMessage ] = useState<string>("")
  const flatListRef = useRef<FlatList<ReChatMessage>>(null);
  const [compLoading, setCompLoading] = useState<boolean>(true) 
  const [refetching, setRefetching ] = useState<boolean>(true)
  const [refetchLoading, setRefetchLoading ] = useState<boolean>(false)
  const hasScrolledRef = useRef(false); 
  const fetchMessages = async (pageNo: number, limitNo: number): Promise<ReChatResponse | undefined> => {
    
  try {
    const query = `?page=${pageNo}&limit=${limitNo}`;
    const fullUrl = url + query;
    console.log("QUERY =>",query)
    const res = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
   console.log(res)
    if (!res.ok) {
      console.error("❌ Fetch failed:", res.status, res.statusText);
      return;
    }

    const data = await res.json(); 
    const formatted: ReChatResponse  = useFormatter && formatter
      ? formatter(data)
      : data; 
    return formatted;
  } catch (error) {
    console.error( error);
    return;
  }
};


useEffect( 
    ()=>{ 
     (async ()=>{ 
            setCompLoading(true)   
 let customFn = customFetch?? fetchMessages  
 let t: ReChatResponse | undefined = await customFn(page, limit) 
 if (t) {
  setMessages(t.messages);
  setPagination({ page: t.pagination.page, limit });

  const total = t.pagination.totalMessages;
  const totalPages = t.pagination.totalPages;

  if (total !== undefined) {
    const atLeastOnePage = totalPages === 1 || total <= limit;
    const moreToFetch = messages.length < total;

    setRefetching(!atLeastOnePage && moreToFetch);
  }
}
    setTimeout(()=>{
        flatListRef.current?.scrollToEnd({ animated: true });
        setTimeout(()=>{ 
        setCompLoading(false)
    },1500)
    },1500)      
})() 
}
,[url])  
useEffect(()=>{

},[])
const refetch = async ()=>{ 
    setRefetchLoading(true)
   try{
    let t =  await fetchMessages(pagination.page+1, limit) 
    setPagination(
        {page:pagination.page+1, limit: limit}
    ) 
  
  if(t?.messages){
    if( messages.length==t.pagination.totalMessages){
        setRefetching(false)
        return;
    }
    let oldMessage = [...t?.messages, ...messages]
   
    setTimeout(()=>{
          setMessages(oldMessage)
    },1100)
  }
   
   }catch(err){
    console.log(Error)
   }finally{
    setTimeout(()=>{
         setRefetchLoading(false)
    },1000)
   }
}


    const renderItem = ({
  item,
  index,
}: {
  item: ReChatMessage;
  index: number;
}) => {
  const isMine = item.sender_id == currentUserId; // make sure to pass this as a prop or context
  
  return (
    <View
      style={[
        styles.messageRow,
        { justifyContent: isMine ? 'flex-end' : 'flex-start' },
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          { backgroundColor: isMine ? '#DCF8C6' : '#FFFFFF' },
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text> 
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};
const handleSendNewMessage = ( ) => { 
  if (!newMessage.trim()) return;

  const messageObj: ReChatMessage = {
    id: Date.now(), // Or use a better unique ID generator
    sender_id: currentUserId, // You should have this from user context or props
    content: newMessage.trim(),
    timestamp: new Date().toISOString(),
  };

  // Add to bottom
  const newMessageList: ReChatMessage[] = [...messages, messageObj];

  setMessages(newMessageList);

  // Optional: scroll to bottom if needed
  setTimeout(()=>{
        flatListRef.current?.scrollToEnd({ animated: true }); 
    },300)
  setNewMessage("")
};
const scrollToBottom = ()=>{
    console.log("hasScrolledRef.current ",hasScrolledRef.current )
    if (!hasScrolledRef.current ) {
    setTimeout(()=>{
        flatListRef.current?.scrollToEnd({ animated: true });
        hasScrolledRef.current = true 
    },300)
}
}

const ListHeaderComponent = ()=>{
    if(Platform.OS != "web"){
        return ;
    }
    if(refetchLoading){
        return <ActivityIndicator/>
    }
    return(
        <>
        {refetching?(
            <Pressable onPress={refetch} style={{width: '100%', alignItems:'center'}}>
            <Text>Get Older Messages...</Text>
        </Pressable>
        ):<View style={{width: '100%', alignItems:'center'}}>
            <Text>No more older messages..</Text>
        </View>}
        </>
    )
}
    return(
        <View style={{flex:1}}> 
        {compLoading&&(
            <View style={{flex:1, position:'absolute',height:'100%',width:'100%',zIndex:1, backgroundColor:'red', justifyContent:'center', alignItems:'center'}}>
                <Text>Loading chats....</Text>
                </View>

        )}
                <FlatList
            ref={flatListRef}
        data= {messages}
        ListEmptyComponent={()=>{return <Text>No Messages in the chat!</Text>}}
        renderItem={typeof customRenderItems == 'function'?customRenderItems: renderItem}
        onContentSizeChange={scrollToBottom}  
        ListHeaderComponent={ListHeaderComponent} 
        refreshControl={
  <RefreshControl
    refreshing={refetchLoading}
    onRefresh={refetch}
  />
}
        /> 
        <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={newMessage}
        onChangeText={setNewMessage}
        onSubmitEditing={handleSendNewMessage}
        returnKeyType="send"
        
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleSendNewMessage}>
        <Ionicons name="send" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
        </View>
    )
}
const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  container: { 
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#ffffffff', 
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f1f1f1ff',
    borderRadius: 25,
    fontSize: 16,
    marginRight: 10,flexGrow:1
  },
  sendButton: {
    backgroundColor: '#007bffff',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
   
  },
});

export default ReChatComponent;