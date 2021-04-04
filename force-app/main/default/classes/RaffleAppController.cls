public class RaffleAppController {

    @AuraEnabled
    public static void insertParticipants(String raffleName, String participantsString) {
        Raffle_Drawing__c drawing = new Raffle_Drawing__c(Name=raffleName);
        insert drawing;

        List<Participant> participants = (List<Participant>)JSON.deserialize(participantsString, List<Participant>.class);
        List<Raffle_Participant__c> participantsToInsert = new List<Raffle_Participant__c>();
        for (Participant participant : participants) {
            participantsToInsert.add(new Raffle_Participant__c(Name=participant.name, Number_of_Tickets__c=participant.numTickets, Raffle_Drawing__c=drawing.Id));
        }
        insert participantsToInsert;
    }

    public class Raffle {
        @AuraEnabled public String name;
        @AuraEnabled public List<Participant> participants;
    }

    public class Participant {
        @AuraEnabled public String name;
        @AuraEnabled public Integer numTickets;

        public Participant(String name, Integer numTickets) {
            this.name = name;
            this.numTickets = numTickets;
        }
    }
}
