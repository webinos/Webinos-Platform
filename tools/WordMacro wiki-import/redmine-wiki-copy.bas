 Dim rng As word.Range

Sub boldTags()
    
    Dim boldWord As String
    boldWord = ""
     
    ActiveDocument.Select
     
    With Selection.Find
        .Forward = True
        .Font.Bold = True
        While .Execute
            boldWord = .Parent.Text
            isHeading = .Parent.Format.Style Like "Heading [0-9]"
            If isHeading = False Then
                .Parent.Text = "*" & boldWord & "*"
            End If
            '  If MsgBox("gevonden woord = " + boldWord, vbOKCancel) = vbCancel Then GoTo ENDSUB
        Wend
    End With
     
ENDSUB:
End Sub
    
    
    
    
  Function DoTable(para)
  On Error Resume Next
  
   Dim fullTable
   fullTable = ""
   
   a = Right$(sCellText, 1)
      
    
    Set theTable = para.Range.Tables(1)

    For Each oRow In theTable.Rows
         ' Loop through each cell in the current row.
         'fullTable = fullTable & "|"
         
         For Each oCell In oRow.Cells
            ' Set sCellText equal to text of the cell.
            ' Note: This section can be modified to suit
            ' your programming purposes.
            sCellText = oCell.Range
            ' Remove table cell markers from the text.
            sCellText = Left$(sCellText, Len(sCellText) - 2)
            
            fullTable = fullTable & "|" & sCellText
            
         Next oCell
          fullTable = fullTable & "|" & vbCrLf
        
      Next oRow
    
   DoTable = fullTable
    
  
  End Function
  
  
 Function DoNChars(theChar, theNo)

    Dim theText As String
    
    For i = 1 To theNo
        theText = theText & theChar
    Next i
    
    DoNChars = theText

 End Function
 

  
  Sub Webinos()
  On Error Resume Next
  
  boldTags
  
  
  
      Set currentDoc = ActiveDocument
      Dim para As Object
    Dim theCharEnd As Integer
    Dim firstTable As Boolean
    
    firstTable = True

    '  Set DocB = word.Documents.Add()
    '  Set rng = DocB.Range
      
    Open "C:\Temp\output.txt" For Output As #1
     
      


      iMaxLevel = 8
      For Each para In currentDoc.Paragraphs
      
          
          DoEvents
          
          theRange = para.Range
          theText = para.Range.Text
          theChar = Mid(theText, 1, 1)
          theCharEnd = Asc(Mid(theText, Len(theText), 1))
          
          theListType = para.Range.ListFormat.ListType
          theListLevel = para.Range.ListFormat.ListLevelNumber
          
          isTable = para.Range.Tables.Count > 0
          If isTable = True Then
            If firstTable = True Then
            
                tableText = DoTable(para)
                Output tableText ' & vbCrLf
                firstTable = False
             End If
                GoTo endloop:
           
          End If
          
          firstTable = True
                  
          
          iLevel = 0
          ' Check for Heading style
          If para.Format.Style Like "Heading [0-9]" Then
              iLevel = Val(Mid(para.Format.Style, 8))
              ' Check for acceptable level
              If iLevel > 0 And iLevel <= iMaxLevel Then
                  Output vbCrLf & "h" & iLevel & ". " & para.Range.Text & vbCrLf
                 ' Format(iLevel) & ") " & para.Range.Text
                '  rng.Text = String(iLevel - 1, vbTab) & _
                 ' Format(iLevel) & ") " & para.Range.Text
              End If
            
            
           ElseIf theListType = wdListBullet Then
           '   Output "* " & para.Range.Text
              Output DoNChars("*", theListLevel) & " " & para.Range.Text
           ElseIf theListType = wdListSimpleNumbering Then
           '  Output "# " & para.Range.Text
              Output DoNChars("#", theListLevel) & " " & para.Range.Text
   
           
           
           ElseIf para.Format.Style Like "Normal" Then
              Output para.Range.Text ' & vbCrLf
             
          
           Else
           Output "HELP!!!!" & para.Range.Text
       '      rng.Collapse wdCollapseEnd
       '      With rng
       '       .Font.Bold = True
       '       .InsertAfter Para.Format.Style
       '       .InsertAfter vbCrLf
       '       .Font.Bold = False
       '       End With
          
            
           End If
           
endloop:

      Next para
Close #1

  End Sub

Sub Output(word)
  '  rng.Collapse wdCollapseEnd
   ' rng.Text = word
    
     Print #1, word;
End Sub