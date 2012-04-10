///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: CombineMode. </summary>
	public partial class CombineModeRelations
	{
		/// <summary>CTor</summary>
		public CombineModeRelations()
		{
		}

		/// <summary>Gets all relations of the CombineModeEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();
			toReturn.Add(this.PolicyEntityUsingCombineModeId);


			return toReturn;
		}

		#region Class Property Declarations

		/// <summary>Returns a new IEntityRelation object, between CombineModeEntity and PolicyEntity over the 1:n relation they have, using the relation between the fields:
		/// CombineMode.Id - Policy.CombineModeId
		/// </summary>
		public virtual IEntityRelation PolicyEntityUsingCombineModeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Policy" , true);
				relation.AddEntityFieldPair(CombineModeFields.Id, PolicyFields.CombineModeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("CombineModeEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyEntity", false);
				return relation;
			}
		}



		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
